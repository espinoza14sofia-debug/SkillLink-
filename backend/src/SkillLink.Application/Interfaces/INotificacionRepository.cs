using SkillLink.Domain.Entities;

namespace SkillLink.Application.Interfaces;

public interface INotificacionRepository
{
    Task<List<Notificacion>> ObtenerPorUsuarioAsync(Guid usuarioId);
    Task<int> ContarNoLeidasAsync(Guid usuarioId);
    Task AgregarAsync(Notificacion notificacion);
    Task<Notificacion?> ObtenerPorIdAsync(Guid id);
    Task MarcarTodasComoLeidasAsync(Guid usuarioId);
    Task GuardarCambiosAsync();
}