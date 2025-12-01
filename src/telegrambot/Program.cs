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
    private static readonly string BotToken = Environment.GetEnvironmentVariable("TELEGRAM_BOT_TOKEN") 
        ?? "8424101909:AAGZr21FDh69fk6ZdDQZqA4bpwOI0ZBjoqQ";
    
    private static readonly string DbConnectionString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING") 
        ?? "Host=localhost;Port=4321;Database=telegrambot;Username=user;Password=password";

    private static readonly string ForumGroupIdStr = Environment.GetEnvironmentVariable("FORUM_GROUP_ID") ?? "-1003237672235";
    private static readonly long? ForumGroupId = string.IsNullOrEmpty(ForumGroupIdStr) ? null : long.Parse(ForumGroupIdStr);

    private static IServiceProvider? _serviceProvider;

    static async Task Main(string[] args)
    {
        Console.WriteLine("Starting Telegram Bot...");

        var services = new ServiceCollection();
        ConfigureServices(services);
        _serviceProvider = services.BuildServiceProvider();

        await InitializeDatabaseAsync();

        var botClient = new TelegramBotClient(BotToken);
        
        var me = await botClient.GetMe();
        Console.WriteLine($"Bot started: @{me.Username}");

        var receiverOptions = new ReceiverOptions
        {
            AllowedUpdates = []
        };

        using var cts = new CancellationTokenSource();

        Console.CancelKeyPress += (sender, e) =>
        {
            e.Cancel = true;
            cts.Cancel();
        };

        botClient.StartReceiving(
            updateHandler: HandleUpdateAsync,
            errorHandler: HandlePollingErrorAsync,
            receiverOptions: receiverOptions,
            cancellationToken: cts.Token
        );

        Console.WriteLine("Bot is running. Press Ctrl+C to exit.");
        
        try
        {
            await Task.Delay(-1, cts.Token);
        }
        catch (TaskCanceledException)
        {
            Console.WriteLine("Bot stopped gracefully.");
        }
    }

    static void ConfigureServices(IServiceCollection services)
    {
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(DbConnectionString));
    }

    static async Task InitializeDatabaseAsync()
    {
        try
        {
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

    static async Task HandleUpdateAsync(ITelegramBotClient botClient, Update update, CancellationToken cancellationToken)
    {
        try
        {
            if (update.Type != UpdateType.Message || update.Message?.Text == null)
                return;

            var message = update.Message;
            var user = message.From;

            if (user == null)
                return;

            var chatId = message.Chat.Id;
            var messageText = message.Text;

            Console.WriteLine($"Received message from {user.Username ?? user.FirstName}: {messageText}");

            if (messageText.StartsWith("/start"))
            {
                await HandleStartCommandAsync(botClient, chatId, user, cancellationToken);
            }
            else
            {
                await ForwardMessageToForumAsync(botClient, message, user, cancellationToken);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error handling update: {ex.Message}");
            Console.WriteLine(ex.StackTrace);
        }
    }

    static async Task HandleStartCommandAsync(ITelegramBotClient botClient, long chatId, User user, CancellationToken cancellationToken)
    {
        try
        {
            var (isNewUser, telegramUser) = await SaveUserToDatabaseAsync(botClient, user, cancellationToken);

            var welcomeMessage = BuildWelcomeMessage(user);

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
            
            await botClient.SendMessage(
                chatId: chatId,
                text: "Произошла ошибка при обработке команды. Попробуйте позже.",
                cancellationToken: cancellationToken
            );
        }
    }

    static async Task<(bool isNewUser, TelegramUser telegramUser)> SaveUserToDatabaseAsync(
        ITelegramBotClient botClient, 
        User user, 
        CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider!.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var existingUser = await dbContext.TelegramUsers
            .FirstOrDefaultAsync(u => u.TelegramId == user.Id, cancellationToken);

        var now = DateTime.UtcNow;
        bool isNewUser = false;
        TelegramUser resultUser;

        if (existingUser != null)
        {
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
            resultUser = existingUser;
        }
        else
        {
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

            await dbContext.TelegramUsers.AddAsync(newUser, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
            
            isNewUser = true;
            resultUser = newUser;
            Console.WriteLine($"Created new user {user.Id}");

            if (ForumGroupId.HasValue)
            {
                var topicId = await CreateForumTopicAsync(botClient, user, cancellationToken);
                if (topicId.HasValue)
                {
                    resultUser.ForumTopicId = topicId.Value;
                    resultUser.UpdatedAt = DateTime.UtcNow;
                    dbContext.TelegramUsers.Update(resultUser);
                }
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return (isNewUser, resultUser);
    }

    static string BuildWelcomeMessage(User user)
    {
        return """
               Отлично! Вы в списке первых пользователей 👏

               Бот не будет присылать лишних сообщений: только одно важное перед запуском, чтобы вы ничего не пропустили

               А пока можно заглянуть в наш Telegram-канал: там мы рассказываем про приложение и делимся новостями
               """;
    }

    static async Task<int?> CreateForumTopicAsync(ITelegramBotClient botClient, User user, CancellationToken cancellationToken)
    {
        if (!ForumGroupId.HasValue)
        {
            Console.WriteLine("Forum group ID not configured");
            return null;
        }

        try
        {
            var topicName = BuildTopicName(user);
            var topic = await botClient.CreateForumTopic(
                chatId: ForumGroupId.Value,
                name: topicName,
                cancellationToken: cancellationToken
            );

            Console.WriteLine($"Created forum topic {topic.MessageThreadId} for user {user.Id}: {topicName}");
            
            var infoMessage = BuildUserInfoMessage(user);
            await botClient.SendMessage(
                chatId: ForumGroupId.Value,
                text: infoMessage,
                messageThreadId: topic.MessageThreadId,
                parseMode: ParseMode.Html,
                cancellationToken: cancellationToken
            );

            return topic.MessageThreadId;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error creating forum topic for user {user.Id}: {ex.Message}");
            Console.WriteLine(ex.StackTrace);
            return null;
        }
    }

    static string BuildTopicName(User user)
    {
        var name = new StringBuilder();
        
        if (!string.IsNullOrEmpty(user.FirstName))
            name.Append(user.FirstName);
        
        if (!string.IsNullOrEmpty(user.LastName))
        {
            if (name.Length > 0)
                name.Append(" ");
            name.Append(user.LastName);
        }

        if (name.Length == 0 && !string.IsNullOrEmpty(user.Username))
            name.Append($"@{user.Username}");

        if (name.Length == 0)
            name.Append($"User {user.Id}");

        return name.ToString();
    }

    static string BuildUserInfoMessage(User user)
    {
        var info = new StringBuilder();
        info.AppendLine("👤 <b>Новый пользователь</b>");
        info.AppendLine();
        info.AppendLine($"<b>ID:</b> <code>{user.Id}</code>");
        
        if (!string.IsNullOrEmpty(user.Username))
            info.AppendLine($"<b>Username:</b> @{user.Username}");
        
        if (!string.IsNullOrEmpty(user.FirstName))
            info.AppendLine($"<b>Имя:</b> {user.FirstName}");
        
        if (!string.IsNullOrEmpty(user.LastName))
            info.AppendLine($"<b>Фамилия:</b> {user.LastName}");
        
        if (!string.IsNullOrEmpty(user.LanguageCode))
            info.AppendLine($"<b>Язык:</b> {user.LanguageCode}");
        
        if (user.IsPremium)
            info.AppendLine("⭐️ <b>Premium</b>");

        return info.ToString();
    }

    static async Task ForwardMessageToForumAsync(ITelegramBotClient botClient, Message message, User user, CancellationToken cancellationToken)
    {
        if (!ForumGroupId.HasValue)
        {
            Console.WriteLine("Forum group ID not configured, skipping message forwarding");
            return;
        }

        try
        {
            using var scope = _serviceProvider!.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            
            var telegramUser = await dbContext.TelegramUsers
                .FirstOrDefaultAsync(u => u.TelegramId == user.Id, cancellationToken);

            if (telegramUser == null)
            {
                Console.WriteLine($"User {user.Id} not found in database");
                return;
            }

            if (!telegramUser.ForumTopicId.HasValue)
            {
                var topicId = await CreateForumTopicAsync(botClient, user, cancellationToken);
                if (topicId.HasValue)
                {
                    telegramUser.ForumTopicId = topicId.Value;
                    telegramUser.UpdatedAt = DateTime.UtcNow;
                    dbContext.TelegramUsers.Update(telegramUser);
                    await dbContext.SaveChangesAsync(cancellationToken);
                }
                else
                {
                    Console.WriteLine($"Failed to create topic for user {user.Id}");
                    return;
                }
            }

            await botClient.ForwardMessage(
                chatId: ForumGroupId.Value,
                fromChatId: message.Chat.Id,
                messageId: message.MessageId,
                messageThreadId: telegramUser.ForumTopicId.Value,
                cancellationToken: cancellationToken
            );

            Console.WriteLine($"Forwarded message from user {user.Id} to topic {telegramUser.ForumTopicId.Value}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error forwarding message to forum: {ex.Message}");
            Console.WriteLine(ex.StackTrace);
        }
    }

    static Task HandlePollingErrorAsync(ITelegramBotClient botClient, Exception exception, CancellationToken cancellationToken)
    {
        Console.WriteLine($"Polling error: {exception.Message}");
        Console.WriteLine(exception.StackTrace);
        return Task.CompletedTask;
    }
}
