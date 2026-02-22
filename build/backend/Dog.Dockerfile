FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

WORKDIR /app

COPY ./Services/Dog ./Services/Dog
COPY ./Api ./Api
COPY ./Shared ./Shared

RUN dotnet restore ./Services/Dog/Dog.Service/Dog.Service.csproj
RUN dotnet publish ./Services/Dog/Dog.Service/Dog.Service.csproj -c Release -o /out

FROM mcr.microsoft.com/dotnet/aspnet:9.0

WORKDIR /app

COPY --from=build /out .

ENTRYPOINT ["dotnet", "Dog.Service.dll"]
