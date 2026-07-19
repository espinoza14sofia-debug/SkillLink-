using SkillLink.Domain.Entities;
namespace SkillLink.Application.Interfaces;
public interface IMensajePrivadoRepository
{
    Task<List<MensajePrivado>> ObtenerConversacionAsync(Guid usuarioId, Guid otroUsuarioId);
    Task<List<MensajePrivado>> ObtenerNuevosAsync(Guid usuarioId, Guid otroUsuarioId, DateTime desde);
    Task AgregarAsync(MensajePrivado mensaje);
    Task GuardarCambiosAsync();
}