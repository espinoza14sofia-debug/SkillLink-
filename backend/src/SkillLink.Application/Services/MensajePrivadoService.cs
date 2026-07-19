using SkillLink.Application.DTOs;
using SkillLink.Application.Interfaces;
using SkillLink.Domain.Entities;

namespace SkillLink.Application.Services;

public class MensajePrivadoService : IMensajePrivadoService
{
    private readonly IMensajePrivadoRepository _repository;

    public MensajePrivadoService(IMensajePrivadoRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<MensajePrivadoRespuestaDto>> ObtenerConversacionAsync(Guid usuarioId, Guid otroUsuarioId)
    {
        var mensajes = await _repository.ObtenerConversacionAsync(usuarioId, otroUsuarioId);
        return mensajes.Select(MapearADto).ToList();
    }

    public async Task<List<MensajePrivadoRespuestaDto>> ObtenerNuevosAsync(Guid usuarioId, Guid otroUsuarioId, DateTime desde)
    {
        var mensajes = await _repository.ObtenerNuevosAsync(usuarioId, otroUsuarioId, desde);
        return mensajes.Select(MapearADto).ToList();
    }

    public async Task<MensajePrivadoRespuestaDto> EnviarAsync(Guid usuarioId, Guid otroUsuarioId, MensajePrivadoCrearDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Contenido))
        {
            throw new InvalidOperationException("El mensaje no puede estar vacío.");
        }

        if (usuarioId == otroUsuarioId)
        {
            throw new InvalidOperationException("No puedes enviarte mensajes a ti mismo.");
        }

        var mensaje = new MensajePrivado
        {
            Id = Guid.NewGuid(),
            EmisorId = usuarioId,
            ReceptorId = otroUsuarioId,
            Contenido = dto.Contenido.Trim(),
            Fecha = DateTime.UtcNow
        };

        await _repository.AgregarAsync(mensaje);
        await _repository.GuardarCambiosAsync();

        var nuevos = await _repository.ObtenerNuevosAsync(usuarioId, otroUsuarioId, mensaje.Fecha.AddSeconds(-1));
        var creado = nuevos.FirstOrDefault(m => m.Id == mensaje.Id) ?? mensaje;

        return MapearADto(creado);
    }

    private static MensajePrivadoRespuestaDto MapearADto(MensajePrivado mensaje)
    {
        return new MensajePrivadoRespuestaDto
        {
            Id = mensaje.Id,
            EmisorId = mensaje.EmisorId,
            EmisorNombre = mensaje.Emisor?.Nombre ?? "Desconocido",
            ReceptorId = mensaje.ReceptorId,
            Contenido = mensaje.Contenido,
            Fecha = mensaje.Fecha
        };
    }
}