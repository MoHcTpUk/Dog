using System.Diagnostics;
using System.Text;
using System.Text.Json;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using NATS.Client;
using Shared.Messaging.Interfaces;

namespace Shared.Messaging.Messaging;

public class NatsCommandBus : ICommandBus
{
    private const int TimeoutMs = 5000 * 1000;

    private readonly Dictionary<string, Type> _commandTypes;
    private readonly IConnection _connection;
    private readonly JsonSerializerOptions _jsonOpts = new(JsonSerializerDefaults.Web);
    private readonly IServiceProvider _serviceProvider;

    public NatsCommandBus(IConnection connection, IServiceProvider serviceProvider)
    {
        _connection = connection;
        _serviceProvider = serviceProvider;

        _commandTypes = AppDomain.CurrentDomain.GetAssemblies()
            .SelectMany(a => a.GetTypes())
            .Where(t => t is { IsAbstract: false, IsInterface: false })
            .Where(t => t.GetInterfaces().Any(i =>
                typeof(ICommand).IsAssignableFrom(t) ||
                (i.IsGenericType && i.GetGenericTypeDefinition() == typeof(ICommand<>))))
            .ToDictionary(t => t.Name, t => t);
    }

    public async Task<TResult?> SendAsync<TCommand, TResult>(TCommand command, string subject)
        where TCommand : ICommand<TResult>
    {
        var envelope = new Envelope<TCommand>
        {
            Data = command
        };

        var payload = JsonSerializer.SerializeToUtf8Bytes(envelope, _jsonOpts);

        var msg = await _connection.RequestAsync($"{subject}.default", payload, TimeoutMs);

        var json = Encoding.UTF8.GetString(msg.Data);

        var responseEnvelope = JsonSerializer.Deserialize<NatsResponseEnvelope>(json, _jsonOpts);

        switch (responseEnvelope)
        {
            case { Ok: false, Problem: null }:
                throw new Exception("No response");
            case null:
                throw new Exception("Response envelope is null");
        }

        if (!responseEnvelope.Ok)
            throw new RemoteProblemDetailsException(responseEnvelope.Problem
                                                    ?? new Rfc7807ProblemDetails
                                                    {
                                                        Status = 500,
                                                        Title = "Remote error",
                                                        Detail =
                                                            "Remote service returned an unknown error shape."
                                                    });

        var result = responseEnvelope.Data.HasValue
            ? responseEnvelope.Data.Value.Deserialize<TResult>(_jsonOpts)
            : default;

        return result ?? throw new Exception("No response");
    }


    public void SendAsync<TCommand>(TCommand command, string subject)
        where TCommand : ICommand
    {
        var envelope = new Envelope<TCommand>
        {
            Data = command
        };

        var payload = JsonSerializer.SerializeToUtf8Bytes(envelope, _jsonOpts);
        try
        {
            _connection.Publish($"{subject}.default", payload);
        }
        catch (Exception e)
        {
            Console.WriteLine($"Requested stream: {subject} Error: {e}");
            throw;
        }
    }

    public void RegisterHandler(string subject)
    {
        _connection.SubscribeAsync(subject, async void (sender, args) =>
        {
            try
            {
                await Handle(args);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                // Do not rethrow: handler errors must not crash the subscription loop.
            }
        });
    }

    private async Task Handle(MsgHandlerEventArgs args)
    {
        var hasReply = !string.IsNullOrWhiteSpace(args.Message.Reply);
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

            var json = Encoding.UTF8.GetString(args.Message.Data);
            var envelope = JsonSerializer.Deserialize<RawEnvelope>(json, _jsonOpts);

            if (envelope is null || !_commandTypes.TryGetValue(envelope.Type, out var commandType))
                throw new InvalidOperationException("Unknown command type");

            var command = envelope.Data.Deserialize(commandType, _jsonOpts);
            if (command is null)
                throw new InvalidOperationException($"Failed to deserialize command of type {envelope.Type}");

            var result = await mediator.Send(command);

            if (!hasReply) return;

            var response = NatsResponseEnvelope.Success(result, _jsonOpts);
            var bytes = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(response, _jsonOpts));
            _connection.Publish(args.Message.Reply, bytes);
        }
        catch (Exception ex)
        {
            if (!hasReply)
            {
                Console.WriteLine(ex);
                return;
            }

            var problem = CreateProblemDetails(ex, args.Message.Subject);
            var response = NatsResponseEnvelope.Failure(problem);
            var bytes = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(response, _jsonOpts));
            _connection.Publish(args.Message.Reply, bytes);
        }
    }

    private static Rfc7807ProblemDetails CreateProblemDetails(Exception exception, string? instance)
    {
        if (exception is RemoteProblemDetailsException remoteProblemDetailsException)
            return remoteProblemDetailsException.Problem;

        var ex = exception is AggregateException { InnerException: not null } agg ? agg.InnerException! : exception;

        var status = ex switch
        {
            UnauthorizedAccessException => 401,
            KeyNotFoundException => 404,
            TimeoutException => 504,
            JsonException => 400,
            ArgumentException => 400,
            InvalidOperationException ioe when ioe.Message.Contains("already exists",
                StringComparison.OrdinalIgnoreCase) => 409,
            InvalidOperationException => 400,
            _ => 500
        };

        var traceId = Activity.Current?.Id ?? Guid.NewGuid().ToString("n");

        return new Rfc7807ProblemDetails
        {
            Type = $"https://httpstatuses.com/{status}",
            Title = status switch
            {
                400 => "Bad Request",
                401 => "Unauthorized",
                404 => "Not Found",
                409 => "Conflict",
                504 => "Gateway Timeout",
                _ => "Internal Server Error"
            },
            Status = status,
            Detail = ex.Message,
            Instance = instance,
            Extensions = new Dictionary<string, object?>
            {
                ["traceId"] = traceId,
                ["exceptionType"] = ex.GetType().FullName
            }
        };
    }
}