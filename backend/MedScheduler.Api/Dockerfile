# ========= RUNTIME BASE =========
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

# ========= BUILD & PUBLISH (PROD) =========
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY MedScheduler.Api.csproj ./
RUN dotnet restore

COPY . .
RUN dotnet publish -c Release -o /out

# ========= FINAL (PROD) =========
FROM runtime AS production
WORKDIR /app
COPY --from=build /out .
ENTRYPOINT ["dotnet", "MedScheduler.Api.dll"]

# ========= DEV (dotnet watch) =========
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS dev
WORKDIR /src/MedScheduler.Api
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENV DOTNET_USE_POLLING_FILE_WATCHER=1
ENV DOTNET_WATCH_RESTART_ON_RUDE_EDIT=1
CMD ["bash","-lc","dotnet tool restore && dotnet watch run"]
