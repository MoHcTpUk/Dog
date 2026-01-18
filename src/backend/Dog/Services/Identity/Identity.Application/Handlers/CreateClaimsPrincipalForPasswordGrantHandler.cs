using Identity.Api.Commands;
using Identity.Application.Services;
using Shared.Messaging.Interfaces;

namespace Identity.Application.Handlers;

public class CreateClaimsPrincipalForPasswordGrantHandler(
    IIdentityService identityService
) : ICommandHandler<CreateClaimsPrincipalForPasswordGrantCommand, CreateClaimsPrincipalResult>
{
    public async Task<CreateClaimsPrincipalResult> Handle(
        CreateClaimsPrincipalForPasswordGrantCommand request,
        CancellationToken cancellationToken)
    {
        var user = await identityService.ValidateUserAsync(request.Username, request.Password, cancellationToken);
        
        if (user == null)
        {
            return new CreateClaimsPrincipalResult
            {
                Success = false,
                ErrorMessage = "Invalid username or password"
            };
        }

        var scopes = request.Scopes.Any() 
            ? request.Scopes 
            : new[] { "openid", "profile", "email" };

        return new CreateClaimsPrincipalResult
        {
            Success = true,
            Subject = user.Id.ToString(),
            Email = user.Email,
            UserName = user.UserName,
            PreferredUsername = user.UserName,
            Scopes = scopes
        };
    }
}
