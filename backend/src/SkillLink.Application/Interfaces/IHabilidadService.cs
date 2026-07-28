using SkillLink.Application.DTOs;

namespace SkillLink.Application.Interfaces;

public interface IHabilidadService
{
    Task<HabilidadRespuestaDto> AgregarHabilidadAsync(Guid usuarioId, HabilidadCrearDto dto);
    Task<List<HabilidadRespuestaDto>> ObtenerHabilidadesDeUsuarioAsync(Guid usuarioId);
    Task<HabilidadRespuestaDto> ActualizarNivelHabilidadAsync(Guid usuarioId, Guid habilidadId, ActualizarNivelHabilidadDto dto);
    Task EliminarHabilidadAsync(Guid usuarioId, Guid habilidadId);
    Task<List<SugerenciaCompaneroDto>> SugerirCompanerosAsync(Guid usuarioId);
}