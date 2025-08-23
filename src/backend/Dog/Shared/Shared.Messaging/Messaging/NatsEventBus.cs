// using System.Text.Json;
// using NATS.Client;
// using NATS.Client.JetStream;
// using Shared.Application.Interfaces;
//
// namespace Shared.Infrastructure.Messaging;
//
// public class NatsEventBus
// {
//     private readonly IJetStream _jetStream;
//     private readonly IConnection _connection;
//     private readonly JsonSerializerOptions _jsonOpts = new(JsonSerializerDefaults.Web);
//
//     public NatsEventBus(IConnection connection)
//     {
//         _connection = connection;
//         _jetStream = connection.CreateJetStreamContext();
//     }
//
//     public async Task PublishAsync<TEvent>(string subject, TEvent @event)
//         where TEvent : IEvent
//     {
//         var payload = JsonSerializer.SerializeToUtf8Bytes(@event, _jsonOpts);
//         await _jetStream.PublishAsync(subject, payload);
//     }
//
//     public void Subscribe<TEvent>(string subject, IEventHandler<TEvent> handler, string durable = "default")
//         where TEvent : IEvent
//     {
//         var options = PushSubscribeOptions.Builder()
//             .WithDurable(durable)
//             .Build();
//
//         _jetStream.PushSubscribeAsync(subject, options, async (sender, args) =>
//         {
//             var @event = JsonSerializer.Deserialize<TEvent>(args.Message.Data, _jsonOpts);
//             await handler.HandleAsync(@event!);
//             args.Message.Ack();
//         });
//     }
// }

