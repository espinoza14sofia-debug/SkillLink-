using SkillLink.Application.DTOs;

namespace SkillLink.Application.Interfaces;

public interface IMensajeService
{
    Task<List<MensajeRespuestaDto>> ObtenerHistorialAsync(Guid equipoId, Guid usuarioId);
    Task<List<MensajeRespuestaDto>> ObtenerNuevosAsync(Guid equipoId, Guid usuarioId, DateTime desde);
    Task<MensajeRespuestaDto> EnviarAsync(Guid equipoId, Guid usuarioId, MensajeCrearDto dto);
}