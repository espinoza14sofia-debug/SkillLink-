using SkillLink.Application.DTOs;

namespace SkillLink.Application.Interfaces;

public interface IInvitacionService
{
    Task InvitarAsync(Guid equipoId, InvitarUsuarioDto dto, Guid usuarioInvitaId);
    Task<List<InvitacionRespuestaDto>> ObtenerMisInvitacionesAsync(Guid usuarioId);
    Task<bool> ResponderAsync(Guid invitacionId, bool aceptar, Guid usuarioId);
}