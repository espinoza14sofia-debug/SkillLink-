using SkillLink.Application.DTOs;
using SkillLink.Application.Interfaces;

namespace SkillLink.Application.Services;

public class XpService : IXpService
{
    private static readonly TimeSpan CooldownMensaje = TimeSpan.FromMinutes(5);
    private const int XpPorMensaje = 5;

    private readonly IUsuarioRepository _usuarioRepository;
    private readonly INivelService _nivelService;
    private readonly ILogroService _logroService;
    private readonly IMisionRepository _misionRepository;
    private readonly INotificacionService _notificacionService;

    public XpService(
        IUsuarioRepository usuarioRepository,
        INivelService nivelService,
        ILogroService logroService,
        IMisionRepository misionRepository,
        INotificacionService notificacionService)
    {
        _usuarioRepository = usuarioRepository;
        _nivelService = nivelService;
        _logroService = logroService;
        _misionRepository = misionRepository;
        _notificacionService = notificacionService;
    }

    public async Task<NivelInfoDto> OtorgarXpAsync(Guid usuarioId, int cantidad)
    {
        if (cantidad <= 0)
        {
            throw new ArgumentException("La cantidad de XP debe ser mayor a cero.");
        }

        var usuario = await _usuarioRepository.ObtenerPorIdAsync(usuarioId);
        if (usuario == null)
        {
            throw new InvalidOperationException("Usuario no encontrado.");
        }

        var nivelAnterior = usuario.Nivel;

        usuario.Xp += cantidad;

        var nivelInfo = await _nivelService.CalcularNivelAsync(usuario.Xp);
        usuario.Nivel = nivelInfo.Nivel;

        await _usuarioRepository.GuardarCambiosAsync();

        nivelInfo.SubioDeNivel = nivelInfo.Nivel > nivelAnterior;

        var misionesCompletadas = await _misionRepository.ContarCompletadasPorUsuarioAsync(usuarioId);
        var nuevosLogros = await _logroService.EvaluarYOtorgarAsync(usuarioId, usuario.Xp, misionesCompletadas);

        nivelInfo.NuevosLogros = nuevosLogros;

        if (nivelInfo.SubioDeNivel)
        {
            await _notificacionService.CrearAsync(
                usuarioId,
                "subida_nivel",
                $"¡Subiste al nivel {nivelInfo.Nivel}!"
            );
        }

        foreach (var logro in nuevosLogros)
        {
            await _notificacionService.CrearAsync(
                usuarioId,
                "logro_desbloqueado",
                $"Desbloqueaste la insignia \"{logro.Nombre}\"."
            );
        }

        return nivelInfo;
    }

    public async Task<NivelInfoDto?> OtorgarXpPorMensajeAsync(Guid usuarioId)
    {
        var usuario = await _usuarioRepository.ObtenerPorIdAsync(usuarioId);
        if (usuario == null)
        {
            throw new InvalidOperationException("Usuario no encontrado.");
        }

        if (usuario.UltimoXpMensajeFecha.HasValue &&
            DateTime.UtcNow - usuario.UltimoXpMensajeFecha.Value < CooldownMensaje)
        {
            return null; // todavía en cooldown, no se otorga XP esta vez
        }

        usuario.UltimoXpMensajeFecha = DateTime.UtcNow;
        await _usuarioRepository.GuardarCambiosAsync();

        return await OtorgarXpAsync(usuarioId, XpPorMensaje);
    }
}