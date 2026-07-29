using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillLink.Application.DTOs;
using SkillLink.Application.Interfaces;
using SkillLink.Domain.Entities;

namespace SkillLink.Api.Controllers;

[ApiController]
[Route("api/push")]
[Authorize]
public class PushController : ControllerBase
{
    private readonly IPushSubscriptionRepository _pushRepository;
    private readonly IConfiguration _configuration;

    public PushController(IPushSubscriptionRepository pushRepository, IConfiguration configuration)
    {
        _pushRepository = pushRepository;
        _configuration = configuration;
    }

    private Guid? ObtenerUsuarioId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                           ?? User.FindFirstValue("sub");
        return Guid.TryParse(userIdClaim, out var id) ? id : null;
    }

    // GET: api/push/clave-publica
    [HttpGet("clave-publica")]
    [AllowAnonymous]
    public IActionResult ObtenerClavePublica()
    {
        var clavePublica = _configuration["VapidKeys:PublicKey"];
        return Ok(new { clavePublica });
    }

    // POST: api/push/suscribirse
    [HttpPost("suscribirse")]
    public async Task<IActionResult> Suscribirse([FromBody] PushSuscripcionDto dto)
    {
        var usuarioId = ObtenerUsuarioId();
        if (usuarioId == null) return Unauthorized();

        var suscripcion = new SkillLink.Domain.Entities.PushSubscription
        {
            Id = Guid.NewGuid(),
            UsuarioId = usuarioId.Value,
            Endpoint = dto.Endpoint,
            P256dh = dto.Keys.P256dh,
            Auth = dto.Keys.Auth,
            FechaCreacion = DateTime.UtcNow
        };

        await _pushRepository.GuardarOActualizarAsync(suscripcion);
        return Ok(new { mensaje = "Suscripción guardada correctamente." });
    }

    // DELETE: api/push/desuscribirse
    [HttpDelete("desuscribirse")]
    public async Task<IActionResult> Desuscribirse([FromQuery] string endpoint)
    {
        await _pushRepository.EliminarPorEndpointAsync(endpoint);
        return NoContent();
    }
}