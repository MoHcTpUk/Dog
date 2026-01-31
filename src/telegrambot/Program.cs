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
        ?? "Host=infra_postgres;Port=5432;Database=telegrambot;Username=user;Password=password";

    private static readonly string ForumGroupIdStr = Environment.GetEnvironmentVariable("FORUM_GROUP_ID") ?? "-1003237672235";
    private static readonly long? ForumGroupId = string.IsNullOrEmpty(ForumGroupIdStr) ? null : long.Parse(ForumGroupIdStr);

    private static IServiceProvider? _serviceProvider;

    private static readonly int BroadcastTopic = 37;
    
    static async Task Main()
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
            var topicId = message.MessageThreadId ?? 0;
            
            Console.WriteLine($"Received message from {user.Username ?? user.FirstName}: {messageText} in chat {chatId}, topic {topicId}");

            if (chatId == ForumGroupId)
            {
                await HandleForumMessageAsync(botClient, message, cancellationToken);
                return;
            }

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

    static async Task HandleForumMessageAsync(ITelegramBotClient botClient, Message message, CancellationToken cancellationToken)
    {
        try
        {
            if (!message.MessageThreadId.HasValue)
            {
                Console.WriteLine("Message in forum group but not in a topic, ignoring");
                return;
            }

            var topicId = message.MessageThreadId.Value;

            using var scope = _serviceProvider!.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            if (topicId == BroadcastTopic)
            {
                await BroadcastMessageToAllUsersAsync(botClient, message, dbContext, cancellationToken);
                return;
            }

            var telegramUser = await dbContext.TelegramUsers
                .FirstOrDefaultAsync(u => u.ForumTopicId == topicId, cancellationToken);

            if (telegramUser == null)
            {
                Console.WriteLine($"No user found for topic {topicId}");
                return;
            }

            var messageText = message.Text ?? "[Сообщение без текста]";
            var senderName = message.From?.FirstName ?? "Администратор";
            
            if (!string.IsNullOrEmpty(message.From?.Username))
                senderName = $"{senderName} (@{message.From.Username})";

            var textToSend = $"💬 <b>Ответ от {senderName}:</b>\n\n{messageText}";

            await botClient.SendMessage(
                chatId: telegramUser.TelegramId,
                text: textToSend,
                parseMode: ParseMode.Html,
                cancellationToken: cancellationToken
            );

            Console.WriteLine($"Sent reply from topic {topicId} to user {telegramUser.TelegramId}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error handling forum message: {ex.Message}");
            Console.WriteLine(ex.StackTrace);
        }
    }

    static async Task BroadcastMessageToAllUsersAsync(ITelegramBotClient botClient, Message message, ApplicationDbContext dbContext, CancellationToken cancellationToken)
    {
        try
        {
            var messageText = message.Text ?? "[Сообщение без текста]";
            Console.WriteLine($"Broadcasting message from topic {BroadcastTopic} to all users: {messageText}");

            var allUsers = await dbContext.TelegramUsers.ToListAsync(cancellationToken);
            
            if (allUsers.Count == 0)
            {
                Console.WriteLine("No users found in database for broadcasting");
                return;
            }

            int successCount = 0;
            int failCount = 0;

            foreach (var user in allUsers)
            {
                try
                {
                    await botClient.SendMessage(
                        chatId: user.TelegramId,
                        text: messageText,
                        parseMode: ParseMode.Html,
                        cancellationToken: cancellationToken
                    );
                    
                    successCount++;
                    Console.WriteLine($"Broadcast message sent to user {user.TelegramId} ({user.Username ?? user.FirstName})");
                    
                    await Task.Delay(50, cancellationToken);
                }
                catch (Exception ex)
                {
                    failCount++;
                    Console.WriteLine($"Failed to send broadcast message to user {user.TelegramId}: {ex.Message}");
                }
            }

            Console.WriteLine($"Broadcast completed: {successCount} successful, {failCount} failed out of {allUsers.Count} users");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in broadcast: {ex.Message}");
            Console.WriteLine(ex.StackTrace);
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
               
               А пока можно заглянуть в наш канал @dogappa: там мы рассказываем про приложение и делимся новостями
               
               Если появятся вопросы или идеи, напишите сюда. Мы на связи!
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

                    await botClient.SendTextMessageAsync(
                        chatId: message.Chat.Id,
                        text: "Спасибо за сообщение! Команда Dog Appa скоро ответит",
                        cancellationToken: cancellationToken
                    );
                }
                else
                {
                    Console.WriteLine($"Failed to create topic for user {user.Id}");
                    return;
                }
            }

            try
            {
                await botClient.ForwardMessage(
                    chatId: ForumGroupId.Value,
                    fromChatId: message.Chat.Id,
                    messageId: message.MessageId,
                    messageThreadId: telegramUser.ForumTopicId.Value,
                    cancellationToken: cancellationToken
                );

                Console.WriteLine($"Forwarded message from user {user.Id} to topic {telegramUser.ForumTopicId.Value}");
            }
            catch (Exception forwardEx)
            {
                if (forwardEx.Message.Contains("thread not found") || 
                    forwardEx.Message.Contains("TOPIC_DELETED") ||
                    forwardEx.Message.Contains("message thread not found"))
                {
                    Console.WriteLine($"Topic {telegramUser.ForumTopicId.Value} was deleted, creating new topic for user {user.Id}");
                    
                    var newTopicId = await CreateForumTopicAsync(botClient, user, cancellationToken);
                    if (newTopicId.HasValue)
                    {
                        telegramUser.ForumTopicId = newTopicId.Value;
                        telegramUser.UpdatedAt = DateTime.UtcNow;
                        dbContext.TelegramUsers.Update(telegramUser);
                        await dbContext.SaveChangesAsync(cancellationToken);

                        Console.WriteLine($"Created new topic {newTopicId.Value} for user {user.Id}");

                        await botClient.ForwardMessage(
                            chatId: ForumGroupId.Value,
                            fromChatId: message.Chat.Id,
                            messageId: message.MessageId,
                            messageThreadId: newTopicId.Value,
                            cancellationToken: cancellationToken
                        );

                        Console.WriteLine($"Forwarded message from user {user.Id} to new topic {newTopicId.Value}");
                    }
                    else
                    {
                        Console.WriteLine($"Failed to create new topic for user {user.Id}");
                        throw;
                    }
                }
                else
                {
                    throw;
                }
            }
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
