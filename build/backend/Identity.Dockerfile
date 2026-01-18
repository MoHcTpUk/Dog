FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

WORKDIR /app

COPY ./Api/Identity.Api ./Api/Identity.Api
COPY ./Services/Identity ./Services/Identity
COPY ./Shared ./Shared

RUN dotnet restore ./Api/Identity.Api/Identity.Api.csproj
RUN dotnet publish ./Api/Identity.Api/Identity.Api.csproj -c Release -o /out

FROM mcr.microsoft.com/dotnet/aspnet:9.0

WORKDIR /app

COPY --from=build /out .

ENTRYPOINT ["dotnet", "Identity.Api.dll"]
