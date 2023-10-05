#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.
#FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
FROM mcr.microsoft.com/dotnet/aspnet:7.0-bullseye-slim AS base
#FROM mcr.microsoft.com/dotnet/sdk:6.0-alpine as build
#FROM mcr.microsoft.com/dotnet/aspnet:8.0-preview-jammy-amd64 AS base
#FROM  mcr.microsoft.com/dotnet/aspnet:6.0-focal-amd64 as base
#Install dependencies
RUN apt-get update
RUN apt-get update && apt-get install -y libfontconfig1
# RUN apt-get install -y libc6 libgdiplus libicu-dev libharfbuzz0b libfontconfig1 libfreetype6
# RUN apt-get install -y libpango-1.0-0 libpangocairo-1.0
EXPOSE 80
EXPOSE 443
WORKDIR /app
#COPY . .
COPY . /app
ENTRYPOINT ["sh", "-c", "dotnet $(find . -maxdepth 1 -name '*.Web.Host.dll' -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -f2- -d' ')"]