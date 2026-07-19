using SkillLink.Application.DTOs;

namespace SkillLink.Application.Interfaces;

public interface IXpService
{
    Task<NivelInfoDto> OtorgarXpAsync(Guid usuarioId, int cantidad);
    Task<NivelInfoDto?> OtorgarXpPorMensajeAsync(Guid usuarioId);
}