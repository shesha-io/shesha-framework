#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base

ENV ASPNETCORE_URLS=http://+:8080;https://+:8081
EXPOSE 8080
EXPOSE 8081

WORKDIR /app

COPY . /app

USER $APP_UID
ENTRYPOINT ["sh", "-c", "dotnet $(find . -maxdepth 1 -name '*.Web.Host.dll' -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -f2- -d' ')"]