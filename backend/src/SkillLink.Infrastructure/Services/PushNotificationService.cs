using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SkillLink.Application.Interfaces;
using WebPush;

namespace SkillLink.Infrastructure.Services;

public class PushNotificationService : IPushNotificationService
{
    private readonly IPushSubscriptionRepository _pushRepository;
    private readonly ILogger<PushNotificationService> _logger;
    private readonly string _publicKey;
    private readonly string _privateKey;
    private readonly string _subject;

    public PushNotificationService(
        IPushSubscriptionRepository pushRepository,
        IConfiguration configuration,
        ILogger<PushNotificationService> logger)
    {
        _pushRepository = pushRepository;
        _logger = logger;
        _publicKey = configuration["VapidKeys:PublicKey"]!;
        _privateKey = configuration["VapidKeys:PrivateKey"]!;
        _subject = configuration["VapidKeys:Subject"] ?? "mailto:soporte@skilllink.com";
    }

    public async Task EnviarATodasLasSuscripcionesAsync(Guid usuarioId, string titulo, string mensaje)
    {
        var suscripciones = await _pushRepository.ObtenerPorUsuarioAsync(usuarioId);
        if (suscripciones.Count == 0) return;

        var vapidDetails = new VapidDetails(_subject, _publicKey, _privateKey);
        var webPushClient = new WebPushClient();

        var payload = System.Text.Json.JsonSerializer.Serialize(new { titulo, mensaje });

        foreach (var s in suscripciones)
        {
            var pushSubscription = new PushSubscription(s.Endpoint, s.P256dh, s.Auth);
            try
            {
                await webPushClient.SendNotificationAsync(pushSubscription, payload, vapidDetails);
            }
            catch (WebPushException ex)
            {
                _logger.LogWarning(ex, "Error al enviar push a endpoint {Endpoint} del usuario {UsuarioId}", s.Endpoint, usuarioId);

                if (ex.StatusCode == System.Net.HttpStatusCode.Gone || ex.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    await _pushRepository.EliminarPorEndpointAsync(s.Endpoint);
                }
            }
        }
    }
}