using SkillLink.Application.DTOs;
using SkillLink.Application.Interfaces;
using SkillLink.Domain.Entities;

namespace SkillLink.Application.Services;

public class MisionService : IMisionService
{
    private readonly IMisionRepository _misionRepository;
    private readonly IXpService _xpService;
    private readonly IActividadService _actividadService;

    public MisionService(
        IMisionRepository misionRepository,
        IXpService xpService,
        IActividadService actividadService)
    {
        _misionRepository = misionRepository;
        _xpService = xpService;
        _actividadService = actividadService;
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
            FechaCreacion = DateTime.UtcNow,

            UsuarioAsignadoId = dto.UsuarioAsignadoId,
            ProyectoId = dto.ProyectoId,
            FechaLimite = dto.FechaLimite,
            Etiquetas = dto.Etiquetas,
            EsUrgente = dto.EsUrgente,
            Progreso = 0
        };

        await _misionRepository.AgregarAsync(mision);
        await _misionRepository.GuardarCambiosAsync();

        var creada = await _misionRepository.ObtenerPorIdAsync(mision.Id);

        return MapearADto(creada!);
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

<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
    public async Task<MisionRespuestaDto> CompletarAsync(Guid misionId, Guid usuarioId)
    {
        var mision = await _misionRepository.ObtenerPorIdAsync(misionId);

        if (mision == null)
        {
            throw new InvalidOperationException("Misión no encontrada.");
        }

        if (mision.UsuarioAsignadoId != usuarioId)
        {
            throw new UnauthorizedAccessException(
                "No puedes completar una misión que no tienes asignada."
            );
        }

        if (mision.Estado == "completada")
        {
            throw new InvalidOperationException(
                "Esta misión ya fue completada."
            );
        }

        mision.Estado = "completada";
        mision.Progreso = 100;

        await _misionRepository.GuardarCambiosAsync();


        var nivelInfo = await _xpService.OtorgarXpAsync(
            usuarioId,
            mision.XpValor
        );


        await _actividadService.RegistrarAsync(
            usuarioId,
            $"Completaste la misión \"{mision.Titulo}\"",
            mision.XpValor
        );


        var dto = MapearADto(mision);

        dto.NuevosLogros = nivelInfo.NuevosLogros;
<<<<<<< Updated upstream
        dto.SubioDeNivel = nivelInfo.SubioDeNivel;
        dto.NuevoNivel = nivelInfo.Nivel;
=======

>>>>>>> Stashed changes
        return dto;
    }
    public async Task<MisionRespuestaDto> ActualizarProgresoAsync(
    Guid misionId,
    Guid usuarioId,
    int progreso)
    {
        if (progreso < 0 || progreso > 100)
        {
            throw new InvalidOperationException(
                "El progreso debe estar entre 0 y 100."
            );
        }

        var mision = await _misionRepository.ObtenerPorIdAsync(misionId);

        if (mision == null)
        {
            throw new InvalidOperationException(
                "Misión no encontrada."
            );
        }

        if (mision.UsuarioAsignadoId != usuarioId)
        {
            throw new UnauthorizedAccessException(
                "No puedes actualizar el progreso de una misión que no tienes asignada."
            );
        }

        if (mision.Estado == "completada")
        {
            throw new InvalidOperationException(
                "No puedes cambiar el progreso de una misión ya completada."
            );
        }

        mision.Progreso = progreso;

        await _misionRepository.GuardarCambiosAsync();

        return MapearADto(mision);
    }


    public async Task<MisionRespuestaDto> ReasignarAsync(
        Guid misionId,
        Guid usuarioActualId,
        Guid nuevoUsuarioId)
    {
        var mision = await _misionRepository.ObtenerPorIdAsync(misionId);

        if (mision == null)
        {
            throw new InvalidOperationException(
                "Misión no encontrada."
            );
        }

        if (mision.UsuarioAsignadoId != usuarioActualId)
        {
            throw new UnauthorizedAccessException(
                "No puedes ceder una misión que no tienes asignada."
            );
        }

        if (mision.Estado == "completada")
        {
            throw new InvalidOperationException(
                "No puedes ceder una misión ya completada."
            );
        }

        mision.UsuarioAsignadoId = nuevoUsuarioId;

        await _misionRepository.GuardarCambiosAsync();

        return MapearADto(mision);
    }


    private static MisionRespuestaDto MapearADto(Mision mision)
    {
        var vencida = mision.FechaLimite.HasValue
            && mision.FechaLimite.Value < DateTime.UtcNow
            && mision.Estado != "completada";


        return new MisionRespuestaDto
        {
            Id = mision.Id,
            Titulo = mision.Titulo,
            Descripcion = mision.Descripcion,
            Estado = mision.Estado,
            XpValor = mision.XpValor,

            UsuarioAsignadoId = mision.UsuarioAsignadoId,

            FechaCreacion = mision.FechaCreacion,

            ProyectoId = mision.ProyectoId,
            ProyectoNombre = mision.Proyecto?.Nombre,

            FechaLimite = mision.FechaLimite,

            Etiquetas = mision.Etiquetas,
            EsUrgente = mision.EsUrgente,

            Progreso = mision.Progreso,

            Vencida = vencida,

            NuevosLogros = new List<LogroDto>()
        };
    }
}