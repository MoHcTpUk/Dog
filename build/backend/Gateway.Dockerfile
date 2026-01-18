FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

WORKDIR /app

COPY ./Api ./Api
COPY ./Gateways ./Gateways
COPY ./Services/Identity ./Services/Identity
COPY ./Shared ./Shared
COPY ./Common ./Common

RUN dotnet restore ./Gateways/Gateway.WebApi/Gateway.WebApi.csproj
RUN dotnet publish ./Gateways/Gateway.WebApi/Gateway.WebApi.csproj -c Release -o /out

FROM mcr.microsoft.com/dotnet/aspnet:9.0

WORKDIR /app

COPY --from=build /out .

ENTRYPOINT ["dotnet", "Gateway.WebApi.dll"]
