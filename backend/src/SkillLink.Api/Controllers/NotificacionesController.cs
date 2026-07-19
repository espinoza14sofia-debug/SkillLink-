using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillLink.Application.Interfaces;

namespace SkillLink.Api.Controllers;

[ApiController]
[Route("api/notificaciones")]
[Authorize]
public class NotificacionesController : ControllerBase
{
    private readonly INotificacionService _service;

    public NotificacionesController(INotificacionService service)
    {
        _service = service;
    }

    private Guid? ObtenerUsuarioId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                           ?? User.FindFirstValue("sub");
        return Guid.TryParse(userIdClaim, out var id) ? id : null;
    }

    [HttpGet]
    public async Task<IActionResult> Obtener()
    {
        var usuarioId = ObtenerUsuarioId();
        if (usuarioId == null) return Unauthorized();

        var notificaciones = await _service.ObtenerMisNotificacionesAsync(usuarioId.Value);
        return Ok(notificaciones);
    }

    [HttpGet("no-leidas/conteo")]
    public async Task<IActionResult> ContarNoLeidas()
    {
        var usuarioId = ObtenerUsuarioId();
        if (usuarioId == null) return Unauthorized();

        var conteo = await _service.ContarNoLeidasAsync(usuarioId.Value);
        return Ok(new { conteo });
    }

    [HttpPut("{id}/leer")]
    public async Task<IActionResult> MarcarComoLeida(Guid id)
    {
        var usuarioId = ObtenerUsuarioId();
        if (usuarioId == null) return Unauthorized();

        var resultado = await _service.MarcarComoLeidaAsync(id, usuarioId.Value);
        if (!resultado) return NotFound();
        return NoContent();
    }

    [HttpPut("leer-todas")]
    public async Task<IActionResult> MarcarTodasComoLeidas()
    {
        var usuarioId = ObtenerUsuarioId();
        if (usuarioId == null) return Unauthorized();

        await _service.MarcarTodasComoLeidasAsync(usuarioId.Value);
        return NoContent();
    }
}