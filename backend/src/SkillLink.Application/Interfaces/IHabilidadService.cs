using SkillLink.Application.DTOs;

namespace SkillLink.Application.Interfaces;

public interface IHabilidadService
{
    Task<HabilidadRespuestaDto> AgregarHabilidadAsync(Guid usuarioId, HabilidadCrearDto dto);
    Task<List<HabilidadRespuestaDto>> ObtenerHabilidadesDeUsuarioAsync(Guid usuarioId);
}