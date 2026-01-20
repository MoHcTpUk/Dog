using Identity.WebApi;
using Environments = Shared.Environments;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddControllers();

builder.Services.AddIdentityWebApi(builder.Configuration);

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

// Map OpenAPI before authentication middleware to ensure it's accessible
if (app.Environment.IsDevelopment() || app.Environment.EnvironmentName == Environments.Local)
{
    app.MapOpenApi().AllowAnonymous();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
