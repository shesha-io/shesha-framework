# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-env
WORKDIR /app

# Copy everything first
COPY . ./

# Build the code analyzer package first and add it as a local nuget source
RUN dotnet build analyzers/SheshaCodeAnalyzers.Package/SheshaCodeAnalyzers.Package.csproj -c Release
RUN dotnet nuget add source "$(pwd)/analyzers/SheshaCodeAnalyzers.Package/bin/Release" --name localpackages

# Create certificate directory and generate self-signed certificate for Docker
RUN mkdir -p /https && \
    apt-get update && apt-get install -y openssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /https/aspnetapp.key \
        -out /https/aspnetapp.crt \
        -subj "/CN=localhost" \
        -addext "subjectAltName=DNS:localhost,IP:127.0.0.1,IP:0.0.0.0" && \
    openssl pkcs12 -export -out /https/aspnetapp.pfx -inkey /https/aspnetapp.key -in /https/aspnetapp.crt -passout pass:password

# Restore and build the main application
RUN dotnet restore
RUN dotnet publish src/*.Web.Host -c Release -o out

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build-env /app/out .

# Copy certificate from build stage
COPY --from=build-env /https /https

# Expose ports (based on README URLs)
EXPOSE 21021
EXPOSE 44362

ENTRYPOINT ["dotnet", "Shesha.Web.Host.dll"]