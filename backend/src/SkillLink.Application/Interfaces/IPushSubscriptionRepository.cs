using SkillLink.Domain.Entities;

namespace SkillLink.Application.Interfaces;

public interface IPushSubscriptionRepository
{
    Task GuardarOActualizarAsync(PushSubscription suscripcion);
    Task<List<PushSubscription>> ObtenerPorUsuarioAsync(Guid usuarioId);
    Task EliminarPorEndpointAsync(string endpoint);
}