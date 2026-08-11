using SkillLink.Application.DTOs;
using SkillLink.Application.Interfaces;
using SkillLink.Domain.Entities;

namespace SkillLink.Application.Services;

public class LogroService : ILogroService
{
    private readonly ILogroRepository _logroRepository;
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IProyectoRepository _proyectoRepository;
    private readonly IMisionRepository _misionRepository;

    public LogroService(
        ILogroRepository logroRepository,
        IUsuarioRepository usuarioRepository,
        IProyectoRepository proyectoRepository,
        IMisionRepository misionRepository)
    {
        _logroRepository = logroRepository;
        _usuarioRepository = usuarioRepository;
        _proyectoRepository = proyectoRepository;
        _misionRepository = misionRepository;
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

    /// <summary>
    /// Evalúa y otorga insignias con base en el estado actual
    /// del usuario en la base de datos.
    /// </summary>
    public async Task<List<LogroDto>> EvaluarYOtorgarAsync(Guid usuarioId)
    {
        var logros = await _logroRepository.ObtenerTodosAsync();
        var nuevos = new List<LogroDto>();

        if (logros.Count == 0)
        {
            return nuevos;
        }

        var usuario = await _usuarioRepository.ObtenerPorIdAsync(usuarioId);

        if (usuario == null)
        {
            return nuevos;
        }

        // Determinar qué datos son necesarios según las condiciones
        // de las insignias existentes.
        var necesitaMisiones = logros.Any(
            l => l.TipoCondicion == "misiones_completadas");

        var necesitaProyectos = logros.Any(
            l => l.TipoCondicion == "proyectos_completados");

        var xpTotal = usuario.Xp;
        var rachaActual = usuario.RachaActual;

        var misionesCompletadas = necesitaMisiones
            ? await _misionRepository.ContarCompletadasPorUsuarioAsync(usuarioId)
            : 0;

        var proyectosCompletados = necesitaProyectos
            ? (await _proyectoRepository.ObtenerPorUsuarioAsync(usuarioId))
                .Count(p => p.Estado == EstadoProyecto.Completado)
            : 0;

        // Obtener las insignias que el usuario ya tiene.
        var yaObtenidos = (await _logroRepository
                .ObtenerPorUsuarioAsync(usuarioId))
            .Select(o => o.LogroId)
            .ToHashSet();

        foreach (var logro in logros)
        {
            // Si ya tiene la insignia, no volver a otorgarla.
            if (yaObtenidos.Contains(logro.Id))
            {
                continue;
            }

            var cumple = logro.TipoCondicion switch
            {
                "xp_total" =>
                    xpTotal >= logro.ValorCondicion,

                "misiones_completadas" =>
                    misionesCompletadas >= logro.ValorCondicion,

                "racha_dias" =>
                    rachaActual >= logro.ValorCondicion,

                "proyectos_completados" =>
                    proyectosCompletados >= logro.ValorCondicion,

                _ => false
            };

            if (!cumple)
            {
                continue;
            }

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

        if (nuevos.Count > 0)
        {
            await _logroRepository.GuardarCambiosAsync();
        }

        return nuevos;
    }
}