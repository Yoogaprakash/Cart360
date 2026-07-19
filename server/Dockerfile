# Multi-stage build for the Cart360 API — run `docker build -f server/Dockerfile server`
# (context must be the `server/` directory so the whole solution is visible to restore).

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY src/Cart360.Domain/*.csproj src/Cart360.Domain/
COPY src/Cart360.Application/*.csproj src/Cart360.Application/
COPY src/Cart360.Infrastructure/*.csproj src/Cart360.Infrastructure/
COPY src/Cart360.API/*.csproj src/Cart360.API/
RUN dotnet restore src/Cart360.API/Cart360.API.csproj

COPY src/ src/
RUN dotnet publish src/Cart360.API/Cart360.API.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app .

# Render sets $PORT at runtime; Kestrel must bind to it (not the launchSettings ports,
# which only apply to local `dotnet run`).
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "ASPNETCORE_URLS=http://0.0.0.0:${PORT:-8080} dotnet Cart360.API.dll"]
