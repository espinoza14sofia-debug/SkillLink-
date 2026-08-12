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
    private readonly IEquipoRepository _equipoRepository;
    private readonly IHabilidadRepository _habilidadRepository;
    private readonly IMensajeRepository _mensajeRepository;

    public LogroService(
        ILogroRepository logroRepository,
        IUsuarioRepository usuarioRepository,
        IProyectoRepository proyectoRepository,
        IMisionRepository misionRepository,
        IEquipoRepository equipoRepository,
        IHabilidadRepository habilidadRepository,
        IMensajeRepository mensajeRepository)
    {
        _logroRepository = logroRepository;
        _usuarioRepository = usuarioRepository;
        _proyectoRepository = proyectoRepository;
        _misionRepository = misionRepository;
        _equipoRepository = equipoRepository;
        _habilidadRepository = habilidadRepository;
        _mensajeRepository = mensajeRepository;
    }

    public async Task<List<LogroDto>> ObtenerLogrosDeUsuarioAsync(Guid usuarioId)
    {
        var todos = await _logroRepository.ObtenerTodosAsync();
        var obtenidos = await _logroRepository.ObtenerPorUsuarioAsync(usuarioId);

        var obtenidosPorId = obtenidos
            .Select(o => o.LogroId)
            .ToHashSet();

        return todos.Select(logro =>
        {
            var obtenido = obtenidos.FirstOrDefault(
                o => o.LogroId == logro.Id
            );

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

        // =========================================================
        // VALORES DIRECTOS DEL USUARIO
        // =========================================================

        var xpTotal = usuario.Xp;
        var rachaActual = usuario.RachaActual;

        // =========================================================
        // LOGROS YA OBTENIDOS
        // =========================================================

        var yaObtenidos = (await _logroRepository
                .ObtenerPorUsuarioAsync(usuarioId))
            .Select(o => o.LogroId)
            .ToHashSet();

        // =========================================================
        // DETERMINAR QUÉ INFORMACIÓN REALMENTE NECESITAMOS
        // =========================================================

        var necesitaMisiones = logros.Any(
            l => l.TipoCondicion == "misiones_completadas"
        );

        var necesitaProyectos = logros.Any(
            l => l.TipoCondicion == "proyectos_creados" ||
                 l.TipoCondicion == "proyectos_completados"
        );

        var necesitaEquipos = logros.Any(
            l => l.TipoCondicion == "equipos_creados"
        );

        var necesitaHabilidades = logros.Any(
            l => l.TipoCondicion == "habilidades_registradas"
        );

        var necesitaMensajes = logros.Any(
            l => l.TipoCondicion == "mensajes_enviados"
        );

        // =========================================================
        // OBTENER DATOS
        // =========================================================

        var misionesCompletadas = necesitaMisiones
            ? await _misionRepository.ContarCompletadasPorUsuarioAsync(usuarioId)
            : 0;

        var proyectos = necesitaProyectos
            ? await _proyectoRepository.ObtenerPorUsuarioAsync(usuarioId)
            : new List<Proyecto>();

        var proyectosCreados = proyectos.Count;

        var proyectosCompletados = proyectos.Count(
            p => p.Estado == EstadoProyecto.Completado
        );

        var equiposCreados = necesitaEquipos
            ? await _equipoRepository.ContarCreadosPorUsuarioAsync(usuarioId)
            : 0;

        var habilidadesRegistradas = necesitaHabilidades
            ? (await _habilidadRepository.ObtenerPorUsuarioAsync(usuarioId)).Count
            : 0;

        var mensajesEnviados = necesitaMensajes
            ? await _mensajeRepository.ContarEnviadosPorUsuarioAsync(usuarioId)
            : 0;

        // =========================================================
        // EVALUAR LOGROS
        // =========================================================

        foreach (var logro in logros)
        {
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

                "proyectos_creados" =>
                    proyectosCreados >= logro.ValorCondicion,

                "proyectos_completados" =>
                    proyectosCompletados >= logro.ValorCondicion,

                "equipos_creados" =>
                    equiposCreados >= logro.ValorCondicion,

                "habilidades_registradas" =>
                    habilidadesRegistradas >= logro.ValorCondicion,

                "mensajes_enviados" =>
                    mensajesEnviados >= logro.ValorCondicion,

                "racha_dias" =>
                    rachaActual >= logro.ValorCondicion,

                _ => false
            };

            if (!cumple)
            {
                continue;
            }

            var fecha = DateTime.UtcNow;

            await _logroRepository.OtorgarAsync(
                new UsuarioLogro
                {
                    UsuarioId = usuarioId,
                    LogroId = logro.Id,
                    FechaObtenido = fecha
                }
            );

            nuevos.Add(
                new LogroDto
                {
                    Id = logro.Id,
                    Nombre = logro.Nombre,
                    Descripcion = logro.Descripcion,
                    Desbloqueado = true,
                    FechaObtenido = fecha
                }
            );
        }

        if (nuevos.Count > 0)
        {
            await _logroRepository.GuardarCambiosAsync();
        }

        return nuevos;
    }
}
