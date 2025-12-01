using Telegram.Bot;
using Telegram.Bot.Polling;
using Telegram.Bot.Types;
using Telegram.Bot.Types.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;
using InviteTelegramBot.Data;
using InviteTelegramBot.Models;
using System.Text;

namespace InviteTelegramBot;

class Program
{
    // Настройки подключения к БД и Telegram
    private static readonly string BotToken = Environment.GetEnvironmentVariable("TELEGRAM_BOT_TOKEN") 
        ?? "8424101909:AAGZr21FDh69fk6ZdDQZqA4bpwOI0ZBjoqQ";
    
    private static readonly string DbConnectionString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING") 
        ?? "Host=localhost;Port=4321;Database=telegrambot;Username=user;Password=password";

    private static IServiceProvider? _serviceProvider;

    static async Task Main(string[] args)
    {
        Console.WriteLine("Starting Telegram Bot...");

        // Настройка Dependency Injection
        var services = new ServiceCollection();
        ConfigureServices(services);
        _serviceProvider = services.BuildServiceProvider();

        // Применение миграций и инициализация базы данных
        await InitializeDatabaseAsync();

        // Создание бота
        var botClient = new TelegramBotClient(BotToken);
        
        // Проверка соединения
        var me = await botClient.GetMe();
        Console.WriteLine($"Bot started: @{me.Username}");

        // Настройка обработчика обновлений
        var receiverOptions = new ReceiverOptions
        {
            AllowedUpdates = [] // Получать все типы обновлений
        };

        using var cts = new CancellationTokenSource();

        // Обработка Ctrl+C для graceful shutdown
        Console.CancelKeyPress += (sender, e) =>
        {
            e.Cancel = true;
            cts.Cancel();
        };

        // Запуск получения обновлений
        botClient.StartReceiving(
            updateHandler: HandleUpdateAsync,
            errorHandler: HandlePollingErrorAsync,
            receiverOptions: receiverOptions,
            cancellationToken: cts.Token
        );

        Console.WriteLine("Bot is running. Press Ctrl+C to exit.");
        
        // Ожидание завершения
        try
        {
            await Task.Delay(-1, cts.Token);
        }
        catch (TaskCanceledException)
        {
            Console.WriteLine("Bot stopped gracefully.");
        }
    }

    /// <summary>
    /// Настройка служб Dependency Injection
    /// </summary>
    static void ConfigureServices(IServiceCollection services)
    {
        // Регистрация DbContext с использованием PostgreSQL
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(DbConnectionString));
    }

    /// <summary>
    /// Инициализация базы данных - создание БД и применение миграций
    /// </summary>
    static async Task InitializeDatabaseAsync()
    {
        try
        {
            // Применение миграций
            using var scope = _serviceProvider!.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            Console.WriteLine("Applying database migrations...");
            await dbContext.Database.MigrateAsync();
            Console.WriteLine("Database migrations applied successfully");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error initializing database: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// Обработчик входящих обновлений
    /// </summary>
    static async Task HandleUpdateAsync(ITelegramBotClient botClient, Update update, CancellationToken cancellationToken)
    {
        try
        {
            // Обрабатываем только текстовые сообщения
            if (update.Type != UpdateType.Message || update.Message?.Text == null)
                return;

            var message = update.Message;
            var user = message.From;

            if (user == null)
                return;

            var chatId = message.Chat.Id;
            var messageText = message.Text;

            Console.WriteLine($"Received message from {user.Username ?? user.FirstName}: {messageText}");

            // Обработка команды /start
            if (messageText.StartsWith("/start"))
            {
                await HandleStartCommandAsync(botClient, chatId, user, cancellationToken);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error handling update: {ex.Message}");
            Console.WriteLine(ex.StackTrace);
        }
    }

    /// <summary>
    /// Обработчик команды /start
    /// </summary>
    static async Task HandleStartCommandAsync(ITelegramBotClient botClient, long chatId, User user, CancellationToken cancellationToken)
    {
        try
        {
            // Сохранение информации о пользователе в БД
            await SaveUserToDatabaseAsync(user);

            // Формирование приветственного сообщения
            var welcomeMessage = BuildWelcomeMessage(user);

            // Отправка приветственного сообщения
            await botClient.SendMessage(
                chatId: chatId,
                text: welcomeMessage,
                parseMode: ParseMode.Html,
                cancellationToken: cancellationToken
            );

            Console.WriteLine($"Welcome message sent to user {user.Id}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error handling /start command: {ex.Message}");
            Console.WriteLine(ex.StackTrace);
            
            // Отправка сообщения об ошибке пользователю
            await botClient.SendMessage(
                chatId: chatId,
                text: "Произошла ошибка при обработке команды. Попробуйте позже.",
                cancellationToken: cancellationToken
            );
        }
    }

    /// <summary>
    /// Сохранение пользователя в базу данных через Entity Framework
    /// </summary>
    static async Task SaveUserToDatabaseAsync(User user)
    {
        using var scope = _serviceProvider!.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // Поиск существующего пользователя
        var existingUser = await dbContext.TelegramUsers
            .FirstOrDefaultAsync(u => u.TelegramId == user.Id);

        var now = DateTime.UtcNow;

        if (existingUser != null)
        {
            // Обновление существующего пользователя
            existingUser.Username = user.Username;
            existingUser.FirstName = user.FirstName;
            existingUser.LastName = user.LastName;
            existingUser.LanguageCode = user.LanguageCode;
            existingUser.IsBot = user.IsBot;
            existingUser.IsPremium = user.IsPremium;
            existingUser.AddedToAttachmentMenu = user.AddedToAttachmentMenu;
            existingUser.CanConnectToBusiness = user.CanConnectToBusiness;
            existingUser.CanJoinGroups = user.CanJoinGroups;
            existingUser.CanReadAllGroupMessages = user.CanReadAllGroupMessages;
            existingUser.HasMainWebApp = user.HasMainWebApp;
            existingUser.SupportsInlineQueries = user.SupportsInlineQueries;
            existingUser.UpdatedAt = now;

            dbContext.TelegramUsers.Update(existingUser);
            Console.WriteLine($"Updated existing user {user.Id}");
        }
        else
        {
            // Создание нового пользователя
            var newUser = new TelegramUser
            {
                TelegramId = user.Id,
                Username = user.Username,
                FirstName = user.FirstName,
                LastName = user.LastName,
                LanguageCode = user.LanguageCode,
                IsBot = user.IsBot,
                IsPremium = user.IsPremium,
                AddedToAttachmentMenu = user.AddedToAttachmentMenu,
                CanConnectToBusiness = user.CanConnectToBusiness,
                CanJoinGroups = user.CanJoinGroups,
                CanReadAllGroupMessages = user.CanReadAllGroupMessages,
                HasMainWebApp = user.HasMainWebApp,
                SupportsInlineQueries = user.SupportsInlineQueries,
                CreatedAt = now,
                UpdatedAt = now
            };

            await dbContext.TelegramUsers.AddAsync(newUser);
            Console.WriteLine($"Created new user {user.Id}");
        }

        await dbContext.SaveChangesAsync();
    }

    /// <summary>
    /// Формирование приветственного сообщения
    /// </summary>
    static string BuildWelcomeMessage(User user)
    {
        return """
               Отлично! Вы в списке первых пользователей 👏

               Бот не будет присылать лишних сообщений: только одно важное перед запуском, чтобы вы ничего не пропустили

               А пока можно заглянуть в наш Telegram-канал: там мы рассказываем про приложение и делимся новостями
               """;
    }

    /// <summary>
    /// Обработчик ошибок при получении обновлений
    /// </summary>
    static Task HandlePollingErrorAsync(ITelegramBotClient botClient, Exception exception, CancellationToken cancellationToken)
    {
        Console.WriteLine($"Polling error: {exception.Message}");
        Console.WriteLine(exception.StackTrace);
        return Task.CompletedTask;
    }
}
