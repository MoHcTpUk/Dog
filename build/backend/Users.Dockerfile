FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

WORKDIR /app

COPY ./Api/Users.Api ./Api/Users.Api
COPY ./Api/Identity.Api ./Api/Identity.Api
COPY ./Services/Users ./Services/Users
COPY ./Shared ./Shared

RUN dotnet restore ./Services/Users/Users.Service/Users.Service.csproj
RUN dotnet publish ./Services/Users/Users.Service/Users.Service.csproj -c Release -o /out

FROM mcr.microsoft.com/dotnet/aspnet:9.0

WORKDIR /app

COPY --from=build /out .

ENTRYPOINT ["dotnet", "Users.Service.dll"]
