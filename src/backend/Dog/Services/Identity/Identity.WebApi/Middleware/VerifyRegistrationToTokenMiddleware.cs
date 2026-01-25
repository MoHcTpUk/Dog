using System.Text;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.Extensions.Primitives;
using OpenIddict.Abstractions;
using Users.Api.Commands.RegistrationRequest;
using Users.Api.Services;

namespace Identity.WebApi.Middleware;

/// <summary>
///     Allows returning an OpenIddict SignIn (token response) "from" /Users/VerifyRegistrationRequest
///     by translating the JSON payload to a regular password grant request and re-executing the
///     existing /connect/token pipeline within the same HTTP request.
/// </summary>
public sealed class VerifyRegistrationToTokenMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context, IUserService userService)
    {
        var path = (context.Request.Path.Value ?? string.Empty).TrimEnd('/');
        if (!HttpMethods.IsPost(context.Request.Method) ||
            !path.EndsWith("/connect/token", StringComparison.OrdinalIgnoreCase))
        {
            await next(context);
            return;
        }
        
        context.Request.EnableBuffering();

        var incomingForm = await context.Request.ReadFormAsync();
        
        if (context.Request.Body.CanSeek)
            context.Request.Body.Position = 0;

        context.Request.Form = incomingForm;
        context.Features.Set<IFormFeature>(new FormFeature(incomingForm));

        var hasVerificationCode = incomingForm.TryGetValue("verificationCode", out var verificationCodeValue);
        var verificationCode = hasVerificationCode ? verificationCodeValue.ToString() : string.Empty;

        var hasVerificationId = incomingForm.TryGetValue("id", out var verificationIdValue);
        var verificationId = hasVerificationId ? Guid.Parse(verificationIdValue!) : Guid.Empty;
        
        if (!hasVerificationCode || !hasVerificationId)
        {
            await next(context);
            return;
        }
        
        var command = new VerifyRegistrationRequestCommand
        {
            Id = verificationId,
            VerificationCode = verificationCode
        };

        var verifiedUser = await userService.VerifyRegistrationRequest(command);

        var scope = string.Join(' ', new[]
        {
            OpenIddictConstants.Scopes.OpenId,
            OpenIddictConstants.Scopes.Profile,
            OpenIddictConstants.Scopes.Email,
            OpenIddictConstants.Scopes.OfflineAccess
        });

        var form = new Dictionary<string, string?>
        {
            ["grant_type"] = OpenIddictConstants.GrantTypes.Password,
            ["username"] = verifiedUser.UserName,
            ["password"] = verifiedUser.Password,
            ["scope"] = scope,
            ["client_id"] = "dog-app"
        };

        var formString = await new FormUrlEncodedContent(form).ReadAsStringAsync();
        var formBytes = Encoding.UTF8.GetBytes(formString);
        
        // IMPORTANT: ReadFormAsync() caches the parsed form in IFormFeature.
        // Replacing only Request.Body won't affect model binding/OpenIddict unless we also update the cached form.
        context.Request.ContentType = "application/x-www-form-urlencoded";
        context.Request.ContentLength = formBytes.Length;
        context.Request.Body = new MemoryStream(formBytes);

        var replacedForm = new FormCollection(
            form.ToDictionary(kvp => kvp.Key, kvp => new StringValues(kvp.Value)));

        context.Request.Form = replacedForm;
        context.Features.Set<IFormFeature>(new FormFeature(replacedForm));

        await next(context);
    }
}