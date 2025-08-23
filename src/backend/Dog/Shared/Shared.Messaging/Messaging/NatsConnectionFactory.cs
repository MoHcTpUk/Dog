using Microsoft.Extensions.Configuration;
using NATS.Client;

namespace Shared.Messaging.Messaging;

public static class NatsConnectionFactory
{
    public static IConnection Create(IConfiguration configuration)
    {
        var url = configuration["NatsUrl"];
        var opts = ConnectionFactory.GetDefaultOptions();
        opts.Url = url;

        const int maxAttempts = 10;
        const int delaySeconds = 5;

        for (var i = 1; i <= maxAttempts; i++)
            try
            {
                return new ConnectionFactory().CreateConnection(opts);
            }
            catch (NATSConnectionException ex)
            {
                Console.WriteLine($"[NATS][{url}] Attempt {i} of {maxAttempts} failed: {ex.Message}");
                if (i == maxAttempts)
                    throw;

                Thread.Sleep(TimeSpan.FromSeconds(delaySeconds));
            }

        throw new InvalidOperationException("Unreachable code");
    }
}