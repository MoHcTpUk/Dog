using Gateway.Api;
using Users.Api;
using Environments = Shared.Environments;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
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
                .SetIsOriginAllowed(origin => new Uri(origin).Host == "localhost")
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
    });

var app = builder.Build();

if (app.Environment.IsDevelopment() || app.Environment.EnvironmentName == Environments.Local)
{
    app.MapOpenApi();
    app.UseCors("NoLocalCORS");
}

if (app.Environment.IsProduction()) app.UseHttpsRedirection();

app.UseAuthorization();
app.MapControllers();

app.Run();