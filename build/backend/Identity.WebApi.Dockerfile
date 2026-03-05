FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

WORKDIR /app

COPY ./Api/Identity.Api ./Api/Identity.Api
COPY ./Services/Identity ./Services/Identity
COPY ./Services/Users ./Services/Users
COPY ./Shared ./Shared

RUN dotnet restore ./Services/Identity/Identity.WebApi/Identity.WebApi.csproj
RUN dotnet publish ./Services/Identity/Identity.WebApi/Identity.WebApi.csproj -c Release -o /out

FROM mcr.microsoft.com/dotnet/aspnet:9.0

WORKDIR /app

COPY --from=build /out .

ENTRYPOINT ["dotnet", "Identity.WebApi.dll"]
