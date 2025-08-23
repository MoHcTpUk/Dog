using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Shared.Infrastructure;

public abstract class DbContextFactory<TContext> : IDbContextFactory<TContext>
    where TContext : DbContext
{
    private const string ConnectionStringName = "DefaultConnection";

    public TContext CreateDbContext(string[] args)
    {
        var basePath = Directory.GetCurrentDirectory();
        var environmentName = Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT") ?? "Development";

        IConfiguration configuration = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", false, true)
            .AddJsonFile($"appsettings.{environmentName}.json", true)
            .AddEnvironmentVariables()
            .Build();

        return CreateDbContext(configuration);
    }

    public TContext CreateDbContext(IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString(ConnectionStringName);
        if (string.IsNullOrWhiteSpace(connectionString))
            throw new InvalidOperationException($"Connection string '{ConnectionStringName}' is not found.");

        var optionsBuilder = new DbContextOptionsBuilder<TContext>();
        optionsBuilder.UseNpgsql(connectionString);

        var dbContext = Activator.CreateInstance(typeof(TContext), optionsBuilder.Options);
        if (dbContext is null)
            throw new InvalidOperationException($"Unable to create instance of {typeof(TContext)}");

        return (TContext)dbContext;
    }
}