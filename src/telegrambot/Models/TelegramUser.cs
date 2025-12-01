using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InviteTelegramBot.Models;

/// <summary>
/// Модель пользователя Telegram
/// </summary>
public class TelegramUser
{
    /// <summary>
    /// Внутренний ID записи в БД
    /// </summary>
    [Key]
    public long Id { get; set; }

    /// <summary>
    /// Уникальный ID пользователя в Telegram
    /// </summary>
    public long TelegramId { get; set; }

    /// <summary>
    /// Username пользователя (без @)
    /// </summary>
    public string? Username { get; set; }

    /// <summary>
    /// Имя пользователя
    /// </summary>
    public string? FirstName { get; set; }

    /// <summary>
    /// Фамилия пользователя
    /// </summary>
    public string? LastName { get; set; }

    /// <summary>
    /// Код языка пользователя (ru, en, etc.)
    /// </summary>
    public string? LanguageCode { get; set; }

    /// <summary>
    /// Является ли пользователь ботом
    /// </summary>
    public bool IsBot { get; set; }

    /// <summary>
    /// Есть ли у пользователя Telegram Premium
    /// </summary>
    public bool IsPremium { get; set; }

    /// <summary>
    /// Добавлен ли бот в меню вложений
    /// </summary>
    public bool AddedToAttachmentMenu { get; set; }

    /// <summary>
    /// Может ли бот подключиться к бизнес-аккаунту пользователя
    /// </summary>
    [Column("can_connect_to_business")]
    public bool CanConnectToBusiness { get; set; }

    /// <summary>
    /// Может ли бот присоединяться к группам
    /// </summary>
    public bool CanJoinGroups { get; set; }

    /// <summary>
    /// </summary>
    [Column("can_read_all_group_messages")]
    public bool CanReadAllGroupMessages { get; set; }

    /// <summary>
    /// </summary>
    [Column("has_main_web_app")]
    public bool HasMainWebApp { get; set; }

    /// <summary>
    /// </summary>
    [Column("supports_inline_queries")]
    public bool SupportsInlineQueries { get; set; }
    
    /// <summary>
    /// ID топика в группе для сообщений этого пользователя
    /// </summary>
    public int? ForumTopicId { get; set; }
    
    /// <summary>
    /// Дата создания записи
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Дата последнего обновления записи
    /// </summary>
    public DateTime UpdatedAt { get; set; }
}