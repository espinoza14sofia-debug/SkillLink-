using SkillLink.Application.DTOs;

namespace SkillLink.Application.Interfaces;

public interface IAuthService
{
    Task<(bool Exito, string? Error, UsuarioRespuestaDto? Usuario)> RegistrarAsync(RegistroUsuarioDto dto);
    Task<(bool Exito, string? Error, LoginRespuestaDto? Resultado)> LoginAsync(LoginDto dto);
    Task<(bool Exito, string? Error)> SolicitarRecuperacionAsync(SolicitarRecuperacionDto dto);
    Task<(bool Exito, string? Error)> RestablecerPasswordAsync(RestablecerPasswordDto dto);
}