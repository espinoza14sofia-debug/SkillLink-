using SkillLink.Application.DTOs;
using SkillLink.Application.Interfaces;
using SkillLink.Domain.Entities;

namespace SkillLink.Application.Services;

public class InvitacionService : IInvitacionService
{
    private readonly IInvitacionRepository _invitacionRepository;
    private readonly IEquipoRepository _equipoRepository;
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly INotificacionService _notificacionService;

    public InvitacionService(
        IInvitacionRepository invitacionRepository,
        IEquipoRepository equipoRepository,
        IUsuarioRepository usuarioRepository,
        INotificacionService notificacionService)
    {
        _invitacionRepository = invitacionRepository;
        _equipoRepository = equipoRepository;
        _usuarioRepository = usuarioRepository;
        _notificacionService = notificacionService;
    }

    public async Task InvitarAsync(Guid equipoId, InvitarUsuarioDto dto, Guid usuarioInvitaId)
    {
        var solicitante = await _equipoRepository.ObtenerMiembroAsync(equipoId, usuarioInvitaId);
        if (solicitante == null || solicitante.Rol != RolEquipo.Lider)
            throw new UnauthorizedAccessException("Solo el líder puede invitar usuarios.");

        var usuarioInvitado = await _usuarioRepository.ObtenerPorEmailAsync(dto.EmailOUsername);
        if (usuarioInvitado == null)
            throw new InvalidOperationException("Usuario no encontrado.");

        var yaEsMiembro = await _equipoRepository.ObtenerMiembroAsync(equipoId, usuarioInvitado.Id);
        if (yaEsMiembro != null)
            throw new InvalidOperationException("Este usuario ya es miembro del equipo.");

        var invitacionExistente = await _invitacionRepository.ObtenerPendienteAsync(equipoId, usuarioInvitado.Id);
        if (invitacionExistente != null)
            throw new InvalidOperationException("Ya existe una invitación pendiente para este usuario.");

        var invitacion = new InvitacionEquipo
        {
            Id = Guid.NewGuid(),
            EquipoId = equipoId,
            UsuarioInvitadoId = usuarioInvitado.Id,
            UsuarioInvitaId = usuarioInvitaId,
            Estado = EstadoInvitacion.Pendiente,
            FechaCreacion = DateTime.UtcNow
        };

        await _invitacionRepository.CrearAsync(invitacion);

        await _notificacionService.CrearAsync(
            usuarioInvitado.Id,
            "invitacion_equipo",
            "Tienes una nueva invitación para unirte a un equipo."
        );
    }

    public async Task<List<InvitacionRespuestaDto>> ObtenerMisInvitacionesAsync(Guid usuarioId)
    {
        var invitaciones = await _invitacionRepository.ObtenerPendientesPorUsuarioAsync(usuarioId);

        return invitaciones.Select(i => new InvitacionRespuestaDto
        {
            Id = i.Id,
            EquipoId = i.EquipoId,
            NombreEquipo = i.Equipo.Nombre,
            NombreQuienInvita = i.UsuarioInvita.Nombre,
            Estado = i.Estado.ToString(),
            FechaCreacion = i.FechaCreacion
        }).ToList();
    }

    public async Task<bool> ResponderAsync(Guid invitacionId, bool aceptar, Guid usuarioId)
    {
        var invitacion = await _invitacionRepository.ObtenerPorIdAsync(invitacionId);
        if (invitacion == null || invitacion.UsuarioInvitadoId != usuarioId)
            return false;

        if (invitacion.Estado != EstadoInvitacion.Pendiente)
            throw new InvalidOperationException("Esta invitación ya fue respondida.");

        if (aceptar)
        {
            invitacion.Estado = EstadoInvitacion.Aceptada;

            var nuevoMiembro = new MiembroEquipo
            {
                Id = Guid.NewGuid(),
                EquipoId = invitacion.EquipoId,
                UsuarioId = usuarioId,
                Rol = RolEquipo.Colaborador,
                FechaIngreso = DateTime.UtcNow
            };
            await _equipoRepository.AgregarMiembroAsync(nuevoMiembro);
        }
        else
        {
            invitacion.Estado = EstadoInvitacion.Rechazada;
        }

        await _invitacionRepository.GuardarCambiosAsync();
        return true;
    }
}