using System.Security.Claims;

namespace SkillLink.Application.Interfaces;

public interface ITokenService
{
    string GenerateToken(Guid userId, string email);
    ClaimsPrincipal? ValidateToken(string token);
}