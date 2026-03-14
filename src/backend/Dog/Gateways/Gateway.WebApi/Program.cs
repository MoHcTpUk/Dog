using Gateway.Api;
using Dog.Api;
using Users.Api;
using Environments = Shared.Environments;
using Shared.Api.Filters;
using Microsoft.AspNetCore.Mvc;
using OpenIddict.Validation.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer<OpenApiDocumentTransformer>();
});
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddControllers(options =>
{
    options.Filters.Add<RemoteProblemDetailsExceptionFilter>();
    options.Filters.Add<ModelStateProblemDetailsFilter>();
});
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.SuppressModelStateInvalidFilter = true;
});

builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

builder.Services.ConfigureHttpClientDefaults(httpBuilder =>
{
    // OpenIddict.Validation.SystemNetHttp expects HttpClientHandler as primary handler.
    httpBuilder.ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler());
});

var openIddictIssuer = builder.Configuration["OpenIddict:Issuer"] ??
                       (builder.Environment.IsDevelopment() || builder.Environment.EnvironmentName == Environments.Local
                           ? "http://localhost:5126/"
                           : "http://identity-webapi:8080/");
var openIddictAudience = builder.Configuration["OpenIddict:Audience"] ?? "dog-app";

builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme;
});

builder.Services.AddOpenIddict()
    .AddValidation(options =>
    {
        options.SetIssuer(new Uri(openIddictIssuer));
        options.AddAudiences(openIddictAudience);
        options.UseSystemNetHttp();
        options.UseAspNetCore();
    });

builder.Services.AddAuthorization();

builder.Services.AddUsersApi(builder.Configuration);
builder.Services.AddDogApi(builder.Configuration);
builder.Services.AddIdentityApi(builder.Configuration);

if (builder.Environment.IsDevelopment() || builder.Environment.EnvironmentName == Environments.Local)
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("NoLocalCORS", policy =>
        {
            policy
                .SetIsOriginAllowed(origin =>
                {
                    try
                    {
                        var uri = new Uri(origin);
                        var isLocalhost = uri.Host == "localhost" || uri.Host == "127.0.0.1";
                        
                        var isDogappaLocal = uri.Host == "dogappa.local" || uri.Host.EndsWith(".dogappa.local");
                        
                        return isLocalhost || isDogappaLocal;
                    }
                    catch
                    {
                        return false;
                    }
                })
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        });
    });

var app = builder.Build();

if (app.Environment.IsProduction()) app.UseHttpsRedirection();

if (app.Environment.IsDevelopment() || app.Environment.EnvironmentName == Environments.Local)
{
    app.UseCors("NoLocalCORS");
}

if (app.Environment.IsDevelopment() || app.Environment.EnvironmentName == Environments.Local)
{
    app.MapOpenApi().AllowAnonymous();
}

app.MapGet("/test", () => "Hello from Gateway!").AllowAnonymous();

app.UseWhen(
    context => !context.Request.Path.StartsWithSegments("/connect", StringComparison.OrdinalIgnoreCase),
    branch =>
    {
        branch.UseAuthentication();
        branch.UseAuthorization();
    });

app.MapControllers();

app.MapReverseProxy();

app.Run();
