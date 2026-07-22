using SkillLink.Domain.Entities;

namespace SkillLink.Application.Interfaces;

public interface IInvitacionRepository
{
    Task<InvitacionEquipo?> ObtenerPorIdAsync(Guid id);
    Task<InvitacionEquipo?> ObtenerPendienteAsync(Guid equipoId, Guid usuarioInvitadoId);
    Task<List<InvitacionEquipo>> ObtenerPendientesPorUsuarioAsync(Guid usuarioId);
    Task CrearAsync(InvitacionEquipo invitacion);
    Task GuardarCambiosAsync();
}