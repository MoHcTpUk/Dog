using Gateway.Api;
using Users.Api;
using Environments = Shared.Environments;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();

// Authentik OIDC configuration from appsettings
var authentikAuthority = builder.Configuration["Authentik:Authority"] 
    ?? "http://localhost:9000/application/o/dogapp/";
var authentikIssuer = builder.Configuration["Authentik:Issuer"] 
    ?? authentikAuthority;

builder.Services.AddAuthentication().AddJwtBearer(options =>
{
    options.Authority = authentikAuthority;
    options.RequireHttpsMetadata = false;
    options.Audience = "dogapp";
    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = authentikIssuer,
        ValidateAudience = true,
        ValidAudience = "dogapp"
    };
});
builder.Services.AddAuthorization();

builder.Services.AddControllers();

builder.Services.AddUsersApi(builder.Configuration);

builder.Services.AddHostedService<AppInitializer>();

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
                        var isLocalhost = uri.Host == "localhost";
                        
                        // Проверяем домены .dogappa.local
                        var isDogappaLocal = uri.Host == "dogappa.local" || uri.Host.EndsWith(".dogappa.local");
                        
                        if (isDogappaLocal)
                        {
                            // Разрешаем все домены .dogappa.local
                            // Проверяем порт: разрешаем 8443 или если порт не указан (-1)
                            var port = uri.Port;
                            var allowed = port == 8443 || port == -1;
                            
                            // Логируем для отладки
                            System.Diagnostics.Debug.WriteLine($"CORS check: origin={origin}, host={uri.Host}, port={port}, allowed={allowed}");
                            
                            return allowed;
                        }
                        
                        return isLocalhost;
                    }
                    catch (Exception ex)
                    {
                        // Логируем ошибку для отладки
                        System.Diagnostics.Debug.WriteLine($"CORS origin validation error: {ex.Message} for origin: {origin}");
                        return false;
                    }
                })
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        });
    });

var app = builder.Build();

if (app.Environment.IsDevelopment() || app.Environment.EnvironmentName == Environments.Local)
{
    app.MapOpenApi();
}

if (app.Environment.IsProduction()) app.UseHttpsRedirection();

if (app.Environment.IsDevelopment() || app.Environment.EnvironmentName == Environments.Local)
{
    app.UseCors("NoLocalCORS");
}

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
