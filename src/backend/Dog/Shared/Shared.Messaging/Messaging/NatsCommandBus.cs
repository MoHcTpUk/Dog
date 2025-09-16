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
        try
        {
            var msg = await _connection.RequestAsync($"{subject}.default", payload, TimeoutMs);

            var json = Encoding.UTF8.GetString(msg.Data);
            var resultEnvelope = JsonSerializer.Deserialize<TResult>(json, _jsonOpts);

            if (resultEnvelope == null) throw new Exception("No response");

            return resultEnvelope;
        }
        catch (Exception e)
        {
            Console.WriteLine($"Requested stream: {subject} Error: {e}");
            throw;
        }
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
                throw;
            }
        });
    }

    private async Task Handle(MsgHandlerEventArgs args)
    {
        using var scope = _serviceProvider.CreateScope();
        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

        var json = Encoding.UTF8.GetString(args.Message.Data);
        var envelope = JsonSerializer.Deserialize<RawEnvelope>(json, _jsonOpts);

        if (envelope is null || !_commandTypes.TryGetValue(envelope.Type, out var commandType))
            throw new Exception("Unknown command type");

        var command = envelope.Data.Deserialize(commandType, _jsonOpts);

        if (command is null)
            throw new Exception($"Failed to deserialize command of type {envelope.Type}");

        var result = await mediator.Send(command);

        var resultJson = JsonSerializer.Serialize(result);

        var bytes = Encoding.UTF8.GetBytes(resultJson);

        _connection.Publish(args.Message.Reply, bytes);
    }
}