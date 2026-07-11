using SkillLink.Domain.Entities;

namespace SkillLink.Application.Interfaces;

public interface ITokenRecuperacionRepository
{
    Task CrearAsync(TokenRecuperacion token);
    Task<TokenRecuperacion?> ObtenerPorTokenAsync(string token);
    Task GuardarCambiosAsync();
}