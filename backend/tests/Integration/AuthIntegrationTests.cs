using System.Net;
using System.Net.Http.Json;
using SkillLink.Application.DTOs;
using Xunit;

namespace SkillLink.Tests.Integration;

public class AuthIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public AuthIntegrationTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Register_ConDatosValidos_DeberiaRetornar201()
    {
        var dto = new UsuarioRegistroDto
        {
            Nombre = "Test Usuario",
            Email = $"test_{Guid.NewGuid()}@skilllink.com",
            Password = "Password123",
            Carrera = "Ingeniería en Sistemas"
        };

        var response = await _client.PostAsJsonAsync("/api/auth/register", dto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task Register_ConEmailDuplicado_DeberiaRetornar400()
    {
        var email = $"duplicado_{Guid.NewGuid()}@skilllink.com";
        var dto = new UsuarioRegistroDto
        {
            Nombre = "Usuario Uno",
            Email = email,
            Password = "Password123",
            Carrera = "Ingeniería en Sistemas"
        };

        await _client.PostAsJsonAsync("/api/auth/register", dto);

        // Segundo registro con el mismo email
        var response = await _client.PostAsJsonAsync("/api/auth/register", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Login_ConCredencialesCorrectas_DeberiaRetornarToken()
    {
        var email = $"login_{Guid.NewGuid()}@skilllink.com";
        var password = "Password123";

        await _client.PostAsJsonAsync("/api/auth/register", new UsuarioRegistroDto
        {
            Nombre = "Login Test",
            Email = email,
            Password = password,
            Carrera = "Ingeniería en Sistemas"
        });

        var response = await _client.PostAsJsonAsync("/api/auth/login", new LoginDto
        {
            Email = email,
            Password = password
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<LoginResponseDto>();
        Assert.NotNull(body);
        Assert.False(string.IsNullOrWhiteSpace(body!.Token));
    }

    [Fact]
    public async Task Login_ConCredencialesIncorrectas_DeberiaRetornar401()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login", new LoginDto
        {
            Email = "noexiste@skilllink.com",
            Password = "loquesea"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    // DTO auxiliar solo para deserializar la respuesta del login en el test
    private class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public object? Usuario { get; set; }
    }
}