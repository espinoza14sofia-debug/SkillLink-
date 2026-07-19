using SkillLink.Application.DTOs;
using SkillLink.Application.Interfaces;
using SkillLink.Domain.Entities;

namespace SkillLink.Application.Services;

public class NotificacionService : INotificacionService
{
    private readonly INotificacionRepository _repository;

    public NotificacionService(INotificacionRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<NotificacionRespuestaDto>> ObtenerMisNotificacionesAsync(Guid usuarioId)
    {
        var notificaciones = await _repository.ObtenerPorUsuarioAsync(usuarioId);
        return notificaciones.Select(MapearADto).ToList();
    }

    public async Task<int> ContarNoLeidasAsync(Guid usuarioId)
    {
        return await _repository.ContarNoLeidasAsync(usuarioId);
    }

    public async Task<bool> MarcarComoLeidaAsync(Guid id, Guid usuarioId)
    {
        var notificacion = await _repository.ObtenerPorIdAsync(id);
        if (notificacion == null || notificacion.UsuarioId != usuarioId)
        {
            return false;
        }

        notificacion.Leida = true;
        await _repository.GuardarCambiosAsync();
        return true;
    }

    public async Task MarcarTodasComoLeidasAsync(Guid usuarioId)
    {
        await _repository.MarcarTodasComoLeidasAsync(usuarioId);
    }

    public async Task CrearAsync(Guid usuarioId, string tipo, string mensaje)
    {
        var notificacion = new Notificacion
        {
            Id = Guid.NewGuid(),
            UsuarioId = usuarioId,
            Tipo = tipo,
            Mensaje = mensaje,
            Leida = false,
            Fecha = DateTime.UtcNow
        };

        await _repository.AgregarAsync(notificacion);
        await _repository.GuardarCambiosAsync();
    }

    private static NotificacionRespuestaDto MapearADto(Notificacion notificacion)
    {
        return new NotificacionRespuestaDto
        {
            Id = notificacion.Id,
            Tipo = notificacion.Tipo,
            Mensaje = notificacion.Mensaje,
            Leida = notificacion.Leida,
            Fecha = notificacion.Fecha
        };
    }
}