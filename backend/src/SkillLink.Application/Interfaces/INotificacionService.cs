using SkillLink.Application.DTOs;

namespace SkillLink.Application.Interfaces;

public interface INotificacionService
{
    Task<List<NotificacionRespuestaDto>> ObtenerMisNotificacionesAsync(Guid usuarioId);
    Task<int> ContarNoLeidasAsync(Guid usuarioId);
    Task<bool> MarcarComoLeidaAsync(Guid id, Guid usuarioId);
    Task MarcarTodasComoLeidasAsync(Guid usuarioId);
    Task CrearAsync(Guid usuarioId, string tipo, string mensaje);
}