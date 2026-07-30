using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using SkillLink.Application.DTOs;
using Xunit;

namespace SkillLink.Tests.Integration;

public class XpIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public XpIntegrationTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    private async Task<string> RegistrarYObtenerTokenAsync()
    {
        var email = $"xp_{Guid.NewGuid()}@skilllink.com";
        var password = "Password123";

        await _client.PostAsJsonAsync("/api/auth/register", new UsuarioRegistroDto
        {
            Nombre = "Xp Test",
            Email = email,
            Password = password,
            Carrera = "Ingeniería en Sistemas"
        });

        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", new LoginDto
        {
            Email = email,
            Password = password
        });

        var body = await loginResponse.Content.ReadFromJsonAsync<LoginResponseDto>();
        return body!.Token;
    }

    [Fact]
    public async Task Otorgar_SinToken_DeberiaRetornar401()
    {
        var response = await _client.PostAsJsonAsync("/api/xp/otorgar", new OtorgarXpDto
        {
            Cantidad = 10
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Otorgar_ConTokenValidoYCantidadValida_DeberiaRetornar200YSumarXp()
    {
        var token = await RegistrarYObtenerTokenAsync();

        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.PostAsJsonAsync("/api/xp/otorgar", new OtorgarXpDto
        {
            Cantidad = 10
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var resultado = await response.Content.ReadFromJsonAsync<NivelInfoDto>();
        Assert.NotNull(resultado);
        Assert.Equal(10, resultado!.Xp);
    }

    [Fact]
    public async Task Otorgar_ConCantidadInvalida_DeberiaRetornar400()
    {
        var token = await RegistrarYObtenerTokenAsync();

        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.PostAsJsonAsync("/api/xp/otorgar", new OtorgarXpDto
        {
            Cantidad = 0
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    private class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public object? Usuario { get; set; }
    }
}