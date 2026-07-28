namespace SkillLink.Application.Interfaces;

public interface IPushNotificationService
{
    Task EnviarATodasLasSuscripcionesAsync(Guid usuarioId, string titulo, string mensaje);
}