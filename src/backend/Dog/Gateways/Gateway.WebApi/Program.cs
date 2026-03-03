using Gateway.Api;
using Dog.Api;
using Users.Api;
using Environments = Shared.Environments;
using Microsoft.AspNetCore.OpenApi;
using Shared.Api.Filters;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer<OpenApiDocumentTransformer>();
});
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddControllers(options =>
{
    options.Filters.Add<RemoteProblemDetailsExceptionFilter>();
});

builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

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

app.MapControllers();

app.MapReverseProxy();

app.Run();
