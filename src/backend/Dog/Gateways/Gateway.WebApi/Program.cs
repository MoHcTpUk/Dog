using Gateway.Api;
using Keycloak.Net;
using Users.Api;
using Environments = Shared.Environments;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddAuthentication().AddJwtBearer(options =>
{
    // change port when running from docker
    options.Authority = "http://localhost:8085/realms/dog";
    options.RequireHttpsMetadata = false;
    options.Audience = "dogapp";
});
builder.Services.AddAuthorization();

builder.Services.AddSingleton<KeycloakClient>(sp =>
    new KeycloakClient(
        url: "http://localhost:8085", // URL Keycloak
        userName: "admin",            // admin login
        password: "admin"             // admin password
    )
);

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