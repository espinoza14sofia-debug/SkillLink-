FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["src/SkillLink.Api/SkillLink.Api.csproj", "src/SkillLink.Api/"]
COPY ["src/SkillLink.Application/SkillLink.Application.csproj", "src/SkillLink.Application/"]
COPY ["src/SkillLink.Domain/SkillLink.Domain.csproj", "src/SkillLink.Domain/"]
COPY ["src/SkillLink.Infrastructure/SkillLink.Infrastructure.csproj", "src/SkillLink.Infrastructure/"]

RUN dotnet restore "src/SkillLink.Api/SkillLink.Api.csproj"

COPY . .

WORKDIR "/src/src/SkillLink.Api"
RUN dotnet publish "SkillLink.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000

ENTRYPOINT ["dotnet", "SkillLink.Api.dll"]