using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillLink.Application.DTOs;
using SkillLink.Application.Interfaces;

namespace SkillLink.Api.Controllers;

[ApiController]
[Route("api/equipos/{equipoId}/mensajes")]
[Authorize]
public class MensajesController : ControllerBase
{
    private readonly IMensajeService _mensajeService;

    public MensajesController(IMensajeService mensajeService)
    {
        _mensajeService = mensajeService;
    }

    private Guid? ObtenerUsuarioId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                           ?? User.FindFirstValue("sub");
        return Guid.TryParse(userIdClaim, out var id) ? id : null;
    }

    // GET: api/equipos/{equipoId}/mensajes
    // GET: api/equipos/{equipoId}/mensajes?desde=2026-07-15T10:00:00Z  (para polling)
    [HttpGet]
    public async Task<IActionResult> Obtener(Guid equipoId, [FromQuery] DateTime? desde)
    {
        var usuarioId = ObtenerUsuarioId();
        if (usuarioId == null) return Unauthorized();

        try
        {
            if (desde.HasValue)
            {
                var nuevos = await _mensajeService.ObtenerNuevosAsync(equipoId, usuarioId.Value, desde.Value);
                return Ok(nuevos);
            }

            var historial = await _mensajeService.ObtenerHistorialAsync(equipoId, usuarioId.Value);
            return Ok(historial);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid();
        }
    }

    // POST: api/equipos/{equipoId}/mensajes
    [HttpPost]
    public async Task<IActionResult> Enviar(Guid equipoId, [FromBody] MensajeCrearDto dto)
    {
        var usuarioId = ObtenerUsuarioId();
        if (usuarioId == null) return Unauthorized();

        try
        {
            var creado = await _mensajeService.EnviarAsync(equipoId, usuarioId.Value, dto);
            return Ok(creado);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }
}