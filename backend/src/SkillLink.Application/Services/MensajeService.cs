using SkillLink.Application.DTOs;
using SkillLink.Application.Interfaces;
using SkillLink.Domain.Entities;

namespace SkillLink.Application.Services;

public class MensajeService : IMensajeService
{
    private readonly IMensajeRepository _mensajeRepository;
    private readonly IEquipoRepository _equipoRepository;
    private readonly IXpService _xpService;

    public MensajeService(
        IMensajeRepository mensajeRepository,
        IEquipoRepository equipoRepository,
        IXpService xpService)
    {
        _mensajeRepository = mensajeRepository;
        _equipoRepository = equipoRepository;
        _xpService = xpService;
    }

    public async Task<List<MensajeRespuestaDto>> ObtenerHistorialAsync(Guid equipoId, Guid usuarioId)
    {
        await ValidarMiembroAsync(equipoId, usuarioId);

        var mensajes = await _mensajeRepository.ObtenerPorEquipoAsync(equipoId);
        return mensajes.Select(MapearADto).ToList();
    }

    public async Task<List<MensajeRespuestaDto>> ObtenerNuevosAsync(Guid equipoId, Guid usuarioId, DateTime desde)
    {
        await ValidarMiembroAsync(equipoId, usuarioId);

        var mensajes = await _mensajeRepository.ObtenerNuevosAsync(equipoId, desde);
        return mensajes.Select(MapearADto).ToList();
    }

    public async Task<MensajeRespuestaDto> EnviarAsync(Guid equipoId, Guid usuarioId, MensajeCrearDto dto)
    {
        await ValidarMiembroAsync(equipoId, usuarioId);

        if (string.IsNullOrWhiteSpace(dto.Contenido))
        {
            throw new InvalidOperationException("El mensaje no puede estar vacío.");
        }

        var mensaje = new Mensaje
        {
            Id = Guid.NewGuid(),
            EquipoId = equipoId,
            EmisorId = usuarioId,
            Contenido = dto.Contenido.Trim(),
            Fecha = DateTime.UtcNow
        };

        await _mensajeRepository.AgregarAsync(mensaje);
        await _mensajeRepository.GuardarCambiosAsync();

        int? xpGanado = null;
        bool subioDeNivel = false;
        int nuevoNivel = 0;
        try
        {
            var nivelInfo = await _xpService.OtorgarXpPorMensajeAsync(usuarioId);
            if (nivelInfo != null)
            {
                xpGanado = 5;
                subioDeNivel = nivelInfo.SubioDeNivel;
                nuevoNivel = nivelInfo.Nivel;
            }
        }
        catch
        {
            // Si falla el otorgamiento de XP, no debe romper el envío del mensaje
        }

        var nuevos = await _mensajeRepository.ObtenerNuevosAsync(equipoId, mensaje.Fecha.AddSeconds(-1));
        var creado = nuevos.FirstOrDefault(m => m.Id == mensaje.Id) ?? mensaje;

        var respuesta = MapearADto(creado);
        respuesta.XpGanado = xpGanado;
        respuesta.SubioDeNivel = subioDeNivel;
        respuesta.NuevoNivel = nuevoNivel;
        return respuesta;
    }

    private async Task ValidarMiembroAsync(Guid equipoId, Guid usuarioId)
    {
        var miembro = await _equipoRepository.ObtenerMiembroAsync(equipoId, usuarioId);
        if (miembro == null)
        {
            throw new UnauthorizedAccessException("No perteneces a este equipo.");
        }
    }

    private static MensajeRespuestaDto MapearADto(Mensaje mensaje)
    {
        return new MensajeRespuestaDto
        {
            Id = mensaje.Id,
            EmisorId = mensaje.EmisorId,
            EmisorNombre = mensaje.Emisor?.Nombre ?? "Desconocido",
            Contenido = mensaje.Contenido,
            Fecha = mensaje.Fecha
        };
    }
}