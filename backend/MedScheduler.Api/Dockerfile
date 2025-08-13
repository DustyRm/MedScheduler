FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY MedScheduler.Api/*.csproj ./MedScheduler.Api/
RUN dotnet restore ./MedScheduler.Api/MedScheduler.Api.csproj

COPY MedScheduler.Api/. ./MedScheduler.Api/
RUN dotnet publish ./MedScheduler.Api/MedScheduler.Api.csproj -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "MedScheduler.Api.dll"]
