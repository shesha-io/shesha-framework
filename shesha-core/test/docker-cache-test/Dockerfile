# Thin runtime image over pre-published output.
#
# Runs Shesha.CacheTests.Host -- the purpose-built host for this rig, which carries the
# diagnostics endpoints and runs no Hangfire workers.
#
# The application is published on the HOST (see publish.ps1) rather than built inside the
# container. This keeps the edit -> test loop to seconds instead of minutes, which matters
# because this rig exists to iterate on Shesha.Redis.
#
# The publish output is bind-mounted at runtime by docker-compose (see the `app-publish`
# volume), so a rebuild is: publish.ps1 + `docker compose restart`. No image rebuild.
# The COPY below is the fallback for a frozen/portable image with no bind mount.

FROM mcr.microsoft.com/dotnet/aspnet:8.0

WORKDIR /app

# ICU is present in the base image; we explicitly do NOT run invariant globalization
# because Shesha relies on culture-aware formatting.
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false \
    ASPNETCORE_URLS=http://+:8080

EXPOSE 8080

# Fallback copy — overridden by the bind mount in docker-compose.yml.
COPY publish/ /app/

ENTRYPOINT ["dotnet", "Shesha.CacheTests.Host.dll"]
