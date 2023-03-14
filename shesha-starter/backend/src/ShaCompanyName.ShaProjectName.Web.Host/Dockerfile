#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
EXPOSE 80
EXPOSE 443

WORKDIR /app

COPY . /app

#ENTRYPOINT ["dotnet", "Infra.Shesha.Web.Host.dll"]
#ENTRYPOINT ["dotnet", "*.Web.Host.dll"]
#ENTRYPOINT ["dotnet", "*.Web.Host.dll"]
ENTRYPOINT ["sh", "-c", "dotnet $(find . -maxdepth 1 -name '*.Web.Host.dll' -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -f2- -d' ')"]
