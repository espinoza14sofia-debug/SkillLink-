using SkillLink.Application.DTOs;

namespace SkillLink.Application.Interfaces;

public interface IActividadService
{
    Task RegistrarAsync(Guid usuarioId, string texto, int? xp = null);
    Task<List<ActividadDto>> ObtenerRecientesAsync(Guid usuarioId, int cantidad = 10);
}