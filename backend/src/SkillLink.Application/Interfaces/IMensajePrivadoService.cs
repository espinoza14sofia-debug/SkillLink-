using SkillLink.Application.DTOs;

namespace SkillLink.Application.Interfaces;

public interface IMensajePrivadoService
{
    Task<List<MensajePrivadoRespuestaDto>> ObtenerConversacionAsync(Guid usuarioId, Guid otroUsuarioId);
    Task<List<MensajePrivadoRespuestaDto>> ObtenerNuevosAsync(Guid usuarioId, Guid otroUsuarioId, DateTime desde);
    Task<MensajePrivadoRespuestaDto> EnviarAsync(Guid usuarioId, Guid otroUsuarioId, MensajePrivadoCrearDto dto);
}