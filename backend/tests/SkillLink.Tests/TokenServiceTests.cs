using Microsoft.Extensions.Configuration;
using SkillLink.Infrastructure.Security;
using Xunit;

namespace SkillLink.Tests;

public class TokenServiceTests
{
    private TokenService CrearTokenService(int expiresInMinutes = 60)
    {
        var inMemorySettings = new Dictionary<string, string?>
        {
            { "Jwt:Key", "clave-de-prueba-para-tests-unitarios-1234567890" },
            { "Jwt:Issuer", "SkillLinkApi" },
            { "Jwt:Audience", "SkillLinkClient" },
            { "Jwt:ExpiresInMinutes", expiresInMinutes.ToString() }
        };

        IConfiguration configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        return new TokenService(configuration);
    }

    [Fact]
    public void GenerateToken_DeberiaGenerarTokenValido()
    {
        var service = CrearTokenService();
        var token = service.GenerateToken(Guid.NewGuid(), "test@skilllink.com");

        Assert.False(string.IsNullOrWhiteSpace(token));
    }

    [Fact]
    public void ValidateToken_ConTokenValido_DeberiaRetornarPrincipal()
    {
        var service = CrearTokenService();
        var token = service.GenerateToken(Guid.NewGuid(), "test@skilllink.com");

        var principal = service.ValidateToken(token);

        Assert.NotNull(principal);
    }

    [Fact]
    public void ValidateToken_ConTokenInvalido_DeberiaRetornarNull()
    {
        var service = CrearTokenService();

        var principal = service.ValidateToken("esto-no-es-un-token-valido");

        Assert.Null(principal);
    }

    [Fact]
    public void ValidateToken_ConTokenExpirado_DeberiaRetornarNull()
    {
        var service = CrearTokenService(expiresInMinutes: 0);
        var token = service.GenerateToken(Guid.NewGuid(), "test@skilllink.com");

        System.Threading.Thread.Sleep(1000);

        var principal = service.ValidateToken(token);

        Assert.Null(principal);
    }
}