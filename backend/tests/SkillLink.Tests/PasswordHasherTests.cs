using SkillLink.Infrastructure.Security;
using Xunit;

namespace SkillLink.Tests;

public class PasswordHasherTests
{
    [Fact]
    public void HashPassword_NoDeberiaGuardarTextoPlano()
    {
        var hasher = new PasswordHasher();
        var hash = hasher.HashPassword("MiPassword123");

        Assert.NotEqual("MiPassword123", hash);
    }

    [Fact]
    public void VerifyPassword_ConPasswordCorrecto_DeberiaRetornarTrue()
    {
        var hasher = new PasswordHasher();
        var hash = hasher.HashPassword("MiPassword123");

        Assert.True(hasher.VerifyPassword("MiPassword123", hash));
    }

    [Fact]
    public void VerifyPassword_ConPasswordIncorrecto_DeberiaRetornarFalse()
    {
        var hasher = new PasswordHasher();
        var hash = hasher.HashPassword("MiPassword123");

        Assert.False(hasher.VerifyPassword("PasswordIncorrecto", hash));
    }
}