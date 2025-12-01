FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Копируем csproj и восстанавливаем зависимости
COPY ["src/inviteTelegramBot/InviteTelegramBot.csproj", "inviteTelegramBot/"]
RUN dotnet restore "inviteTelegramBot/InviteTelegramBot.csproj"

# Копируем остальные файлы и собираем
COPY ["src/inviteTelegramBot/", "inviteTelegramBot/"]
WORKDIR "/src/inviteTelegramBot"
RUN dotnet build "InviteTelegramBot.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "InviteTelegramBot.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/runtime:9.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "InviteTelegramBot.dll"]

