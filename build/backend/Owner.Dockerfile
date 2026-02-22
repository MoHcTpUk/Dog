FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

WORKDIR /app

COPY ./Services/Owner ./Services/Owner
COPY ./Api ./Api
COPY ./Shared ./Shared

RUN dotnet restore ./Services/Owner/Owner.Service/Owner.Service.csproj
RUN dotnet publish ./Services/Owner/Owner.Service/Owner.Service.csproj -c Release -o /out

FROM mcr.microsoft.com/dotnet/aspnet:9.0

WORKDIR /app

COPY --from=build /out .

ENTRYPOINT ["dotnet", "Owner.Service.dll"]
