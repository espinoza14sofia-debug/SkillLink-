using SkillLink.Application.DTOs;
using SkillLink.Application.Interfaces;
using SkillLink.Domain.Entities;

namespace SkillLink.Application.Services;

public class LogroService : ILogroService
{
    private readonly ILogroRepository _logroRepository;
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IProyectoRepository _proyectoRepository;

    public LogroService(
        ILogroRepository logroRepository,
        IUsuarioRepository usuarioRepository,
        IProyectoRepository proyectoRepository)
    {
        _logroRepository = logroRepository;
        _usuarioRepository = usuarioRepository;
        _proyectoRepository = proyectoRepository;
    }

    public async Task<List<LogroDto>> ObtenerLogrosDeUsuarioAsync(Guid usuarioId)
    {
        var todos = await _logroRepository.ObtenerTodosAsync();
        var obtenidos = await _logroRepository.ObtenerPorUsuarioAsync(usuarioId);

        return todos.Select(logro =>
        {
            var obtenido = obtenidos.FirstOrDefault(o => o.LogroId == logro.Id);
            return new LogroDto
            {
                Id = logro.Id,
                Nombre = logro.Nombre,
                Descripcion = logro.Descripcion,
                Desbloqueado = obtenido != null,
                FechaObtenido = obtenido?.FechaObtenido
            };
        }).ToList();
    }

    public async Task<List<LogroDto>> EvaluarYOtorgarAsync(Guid usuarioId, int xpTotal, int misionesCompletadas)
    {
        var logros = await _logroRepository.ObtenerTodosAsync();
        var nuevos = new List<LogroDto>();

        // Estos dos solo se calculan si hay al menos un logro que los necesite,
        // para no pegarle a la base de datos de más en cada evaluación.
        var necesitaRacha = logros.Any(l => l.TipoCondicion == "racha_dias");
        var necesitaProyectos = logros.Any(l => l.TipoCondicion == "proyectos_completados");

        var rachaActual = 0;
        if (necesitaRacha)
        {
            var usuario = await _usuarioRepository.ObtenerPorIdAsync(usuarioId);
            rachaActual = usuario?.RachaActual ?? 0;
        }

        var proyectosCompletados = 0;
        if (necesitaProyectos)
        {
            var proyectos = await _proyectoRepository.ObtenerPorUsuarioAsync(usuarioId);
            proyectosCompletados = proyectos.Count(p => p.Estado == EstadoProyecto.Completado);
        }

        foreach (var logro in logros)
        {
            var cumple = logro.TipoCondicion switch
            {
                "xp_total" => xpTotal >= logro.ValorCondicion,
                "misiones_completadas" => misionesCompletadas >= logro.ValorCondicion,
                "racha_dias" => rachaActual >= logro.ValorCondicion,
                "proyectos_completados" => proyectosCompletados >= logro.ValorCondicion,
                _ => false
            };

            if (!cumple) continue;

            var yaLoTiene = await _logroRepository.YaTieneLogroAsync(usuarioId, logro.Id);
            if (yaLoTiene) continue;

            var fecha = DateTime.UtcNow;

            await _logroRepository.OtorgarAsync(new UsuarioLogro
            {
                UsuarioId = usuarioId,
                LogroId = logro.Id,
                FechaObtenido = fecha
            });

            nuevos.Add(new LogroDto
            {
                Id = logro.Id,
                Nombre = logro.Nombre,
                Descripcion = logro.Descripcion,
                Desbloqueado = true,
                FechaObtenido = fecha
            });
        }

        await _logroRepository.GuardarCambiosAsync();

        return nuevos;
    }
}