#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
EXPOSE 80
EXPOSE 443

WORKDIR /app
#COPY . .

COPY . /app

#FROM base AS final
#COPY --from=. /app/publish .

ENTRYPOINT ["dotnet", "Infra.Shesha.Web.Host.dll"]

WORKDIR /app
RUN ls


