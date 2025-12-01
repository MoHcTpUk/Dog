using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace InviteTelegramBot.Data;

/// <summary>
/// Фабрика для создания DbContext во время разработки (для миграций)
/// </summary>
public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        
        // Используем строку подключения по умолчанию для создания миграций
        var connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING") 
            ?? "Host=localhost;Port=4321;Database=telegrambot;Username=user;Password=password";
        
        optionsBuilder.UseNpgsql(connectionString);

        return new ApplicationDbContext(optionsBuilder.Options);
    }
}

