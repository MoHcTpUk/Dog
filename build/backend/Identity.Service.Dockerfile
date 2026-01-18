FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

WORKDIR /app

COPY ./Services/Identity ./Services/Identity
COPY ./Shared ./Shared

RUN dotnet restore ./Services/Identity/Identity.Service/Identity.Service.csproj
RUN dotnet publish ./Services/Identity/Identity.Service/Identity.Service.csproj -c Release -o /out

FROM mcr.microsoft.com/dotnet/aspnet:9.0

WORKDIR /app

COPY --from=build /out .

ENTRYPOINT ["dotnet", "Identity.Service.dll"]
