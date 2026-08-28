# Thin runtime image over pre-published output.
#
# Runs Shesha.CacheTests.Host -- the purpose-built host for this rig, which carries the
# diagnostics endpoints and runs no Hangfire workers.
#
# The application is published on the HOST (see publish.ps1) rather than built inside the
# container. This keeps the edit -> test loop to seconds instead of minutes, which matters
# because this rig exists to iterate on Shesha.Redis.
#
# The published output is COPYed in rather than bind-mounted. A bind mount was tried first and
# had to be abandoned: Docker Desktop's file sharing kept serving a stale copy to the running
# container (an exec into it showed the NEW file, while the process kept running the OLD one), so
# `publish.ps1 + docker compose restart` silently tested code that was several edits behind.
#
# The loop is therefore: publish.ps1, then `docker compose up -d --build`. The COPY is the last
# layer, so the rebuild is quick.

FROM mcr.microsoft.com/dotnet/aspnet:8.0

WORKDIR /app

# ICU is present in the base image; we explicitly do NOT run invariant globalization
# because Shesha relies on culture-aware formatting.
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false \
    ASPNETCORE_URLS=http://+:8080

EXPOSE 8080

COPY publish/ /app/

ENTRYPOINT ["dotnet", "Shesha.CacheTests.Host.dll"]
