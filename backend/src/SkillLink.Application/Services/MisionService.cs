using SkillLink.Application.DTOs;
using SkillLink.Application.Interfaces;
using SkillLink.Domain.Entities;

namespace SkillLink.Application.Services;

public class MisionService : IMisionService
{
    private readonly IMisionRepository _misionRepository;
    private readonly IXpService _xpService;

    public MisionService(IMisionRepository misionRepository, IXpService xpService)
    {
        _misionRepository = misionRepository;
        _xpService = xpService;
    }

    public async Task<MisionRespuestaDto> CrearAsync(MisionCrearDto dto)
    {
        var mision = new Mision
        {
            Id = Guid.NewGuid(),
            Titulo = dto.Titulo,
            Descripcion = dto.Descripcion,
            XpValor = dto.XpValor,
            Estado = "pendiente",
            FechaCreacion = DateTime.UtcNow
        };

        await _misionRepository.AgregarAsync(mision);
        await _misionRepository.GuardarCambiosAsync();

        return MapearADto(mision);
    }

    public async Task<List<MisionRespuestaDto>> ObtenerTodasAsync()
    {
        var misiones = await _misionRepository.ObtenerTodasAsync();
        return misiones.Select(MapearADto).ToList();
    }

    public async Task<List<MisionRespuestaDto>> ObtenerPorUsuarioAsync(Guid usuarioId)
    {
        var misiones = await _misionRepository.ObtenerPorUsuarioAsync(usuarioId);
        return misiones.Select(MapearADto).ToList();
    }

    public async Task<MisionRespuestaDto> AsignarAsync(Guid misionId, Guid usuarioId)
    {
        var mision = await _misionRepository.ObtenerPorIdAsync(misionId);
        if (mision == null)
        {
            throw new InvalidOperationException("Misión no encontrada.");
        }

        mision.UsuarioAsignadoId = usuarioId;
        await _misionRepository.GuardarCambiosAsync();

        return MapearADto(mision);
    }

    public async Task<MisionRespuestaDto> CompletarAsync(Guid misionId, Guid usuarioId)
    {
        var mision = await _misionRepository.ObtenerPorIdAsync(misionId);
        if (mision == null)
        {
            throw new InvalidOperationException("Misión no encontrada.");
        }

        if (mision.UsuarioAsignadoId != usuarioId)
        {
            throw new UnauthorizedAccessException("No puedes completar una misión que no tienes asignada.");
        }

        if (mision.Estado == "completada")
        {
            throw new InvalidOperationException("Esta misión ya fue completada.");
        }

        mision.Estado = "completada";
        await _misionRepository.GuardarCambiosAsync();

        // Otorgar el XP automáticamente
        var nivelInfo = await _xpService.OtorgarXpAsync(usuarioId, mision.XpValor);

        var dto = MapearADto(mision);
        dto.NuevosLogros = nivelInfo.NuevosLogros;
        dto.SubioDeNivel = nivelInfo.SubioDeNivel;
        dto.NuevoNivel = nivelInfo.Nivel;
        return dto;
    }

    private static MisionRespuestaDto MapearADto(Mision mision)
    {
        return new MisionRespuestaDto
        {
            Id = mision.Id,
            Titulo = mision.Titulo,
            Descripcion = mision.Descripcion,
            Estado = mision.Estado,
            XpValor = mision.XpValor,
            UsuarioAsignadoId = mision.UsuarioAsignadoId,
            FechaCreacion = mision.FechaCreacion
        };
    }
}