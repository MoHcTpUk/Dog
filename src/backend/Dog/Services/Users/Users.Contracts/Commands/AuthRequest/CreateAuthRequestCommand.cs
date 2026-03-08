using System.ComponentModel.DataAnnotations;
using Shared.Messaging.Interfaces;
using Shared.Validation;
using Users.Contracts.Dtos;

namespace Users.Contracts.Commands.AuthRequest;

public class CreateAuthRequestCommand : ICommand<AuthRequestDto>
{
    [Required]
    [RegularExpression(ValidationPatterns.Email, ErrorMessage = "Email has invalid format.")]
    public required string Email { get; set; }
}
