using Microsoft.EntityFrameworkCore;
using InviteTelegramBot.Models;

namespace InviteTelegramBot.Data;

/// <summary>
/// Контекст базы данных приложения
/// </summary>
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    /// <summary>
    /// Пользователи Telegram
    /// </summary>
    public DbSet<TelegramUser> TelegramUsers { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Настройка индексов и ограничений
        modelBuilder.Entity<TelegramUser>(entity =>
        {
            // Уникальный индекс на telegram_id
            entity.HasIndex(e => e.TelegramId)
                .IsUnique();

            // Значения по умолчанию
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
        });
    }
}

