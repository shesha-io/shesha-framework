#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

#Install dependencies
# RUN apt-get update
# RUN apt-get update && apt-get install -y libfontconfig1

RUN apt-get update
RUN apt-get install -y libc6 libgdiplus libicu-dev libharfbuzz0b libfontconfig1 libfreetype6
RUN apt-get install -y libpango-1.0-0 libpangocairo-1.0
RUN apt-get install -y libfontconfig1
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . /app

USER $APP_UID
ENTRYPOINT ["sh", "-c", "dotnet $(find . -maxdepth 1 -name '*.Web.Host.dll' -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -f2- -d' ')"]
