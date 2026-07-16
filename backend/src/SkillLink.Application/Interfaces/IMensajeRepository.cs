using SkillLink.Domain.Entities;

namespace SkillLink.Application.Interfaces;

public interface IMensajeRepository
{
    Task<List<Mensaje>> ObtenerPorEquipoAsync(Guid equipoId);
    Task<List<Mensaje>> ObtenerNuevosAsync(Guid equipoId, DateTime desde);
    Task AgregarAsync(Mensaje mensaje);
    Task GuardarCambiosAsync();
}