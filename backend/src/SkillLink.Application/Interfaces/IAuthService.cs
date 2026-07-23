using SkillLink.Application.DTOs;
using System.Threading.Tasks;

namespace SkillLink.Application.Interfaces
{
    public interface IAuthService
    {
        Task<(bool Exito, string? Error, UsuarioRespuestaDto? Usuario)> RegistrarAsync(UsuarioRegistroDto dto);
        Task<(bool Exito, string? Error, LoginRespuestaDto? Resultado)> LoginAsync(LoginDto dto);
        Task<(bool Exito, string? Error)> SolicitarRecuperacionAsync(SolicitarRecuperacionDto dto);
        Task<(bool Exito, string? Error)> RestablecerPasswordAsync(RestablecerPasswordDto dto);
    }
}