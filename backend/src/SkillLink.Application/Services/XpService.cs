using SkillLink.Application.DTOs;
using SkillLink.Application.Interfaces;

namespace SkillLink.Application.Services;

public class XpService : IXpService
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly INivelService _nivelService;
    private readonly ILogroService _logroService;
    private readonly IMisionRepository _misionRepository;

    public XpService(
        IUsuarioRepository usuarioRepository,
        INivelService nivelService,
        ILogroService logroService,
        IMisionRepository misionRepository)
    {
        _usuarioRepository = usuarioRepository;
        _nivelService = nivelService;
        _logroService = logroService;
        _misionRepository = misionRepository;
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

        usuario.Xp += cantidad;

        var nivelInfo = await _nivelService.CalcularNivelAsync(usuario.Xp);
        usuario.Nivel = nivelInfo.Nivel;

        await _usuarioRepository.GuardarCambiosAsync();

        var misionesCompletadas = await _misionRepository.ContarCompletadasPorUsuarioAsync(usuarioId);
        await _logroService.EvaluarYOtorgarAsync(usuarioId, usuario.Xp, misionesCompletadas);

        return nivelInfo;
    }
}