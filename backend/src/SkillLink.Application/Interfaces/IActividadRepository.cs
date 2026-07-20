using SkillLink.Domain.Entities;

namespace SkillLink.Application.Interfaces;

public interface IActividadRepository
{
    Task AgregarAsync(ActividadReciente actividad);
    Task<List<ActividadReciente>> ObtenerRecientesPorUsuarioAsync(Guid usuarioId, int cantidad = 10);
    Task GuardarCambiosAsync();
}