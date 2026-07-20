using SkillLink.Application.DTOs;
using SkillLink.Application.Interfaces;
using SkillLink.Domain.Entities;

namespace SkillLink.Application.Services;

public class ActividadService : IActividadService
{
    private readonly IActividadRepository _actividadRepository;

    public ActividadService(IActividadRepository actividadRepository)
    {
        _actividadRepository = actividadRepository;
    }

    public async Task RegistrarAsync(Guid usuarioId, string texto, int? xp = null)
    {
        var actividad = new ActividadReciente
        {
            Id = Guid.NewGuid(),
            UsuarioId = usuarioId,
            Texto = texto,
            Xp = xp,
            Fecha = DateTime.UtcNow
        };

        await _actividadRepository.AgregarAsync(actividad);
        await _actividadRepository.GuardarCambiosAsync();
    }

    public async Task<List<ActividadDto>> ObtenerRecientesAsync(Guid usuarioId, int cantidad = 10)
    {
        var actividades = await _actividadRepository.ObtenerRecientesPorUsuarioAsync(usuarioId, cantidad);

        return actividades.Select(a => new ActividadDto
        {
            Id = a.Id,
            Texto = a.Texto,
            Xp = a.Xp,
            Tiempo = FormatearTiempoRelativo(a.Fecha)
        }).ToList();
    }

    private static string FormatearTiempoRelativo(DateTime fecha)
    {
        var diferencia = DateTime.UtcNow - fecha;

        if (diferencia.TotalMinutes < 1) return "un momento";
        if (diferencia.TotalMinutes < 60) return $"{(int)diferencia.TotalMinutes} min";
        if (diferencia.TotalHours < 24) return $"{(int)diferencia.TotalHours} horas";
        if (diferencia.TotalDays < 30) return $"{(int)diferencia.TotalDays} días";
        return $"{(int)(diferencia.TotalDays / 30)} meses";
    }
}