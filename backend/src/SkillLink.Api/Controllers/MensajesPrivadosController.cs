using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillLink.Application.DTOs;
using SkillLink.Application.Interfaces;

namespace SkillLink.Api.Controllers;

[ApiController]
[Route("api/mensajes-privados/{otroUsuarioId}")]
[Authorize]
public class MensajesPrivadosController : ControllerBase
{
    private readonly IMensajePrivadoService _service;

    public MensajesPrivadosController(IMensajePrivadoService service)
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
    public async Task<IActionResult> Obtener(Guid otroUsuarioId, [FromQuery] DateTime? desde)
    {
        var usuarioId = ObtenerUsuarioId();
        if (usuarioId == null) return Unauthorized();

        if (desde.HasValue)
        {
            var nuevos = await _service.ObtenerNuevosAsync(usuarioId.Value, otroUsuarioId, desde.Value);
            return Ok(nuevos);
        }

        var historial = await _service.ObtenerConversacionAsync(usuarioId.Value, otroUsuarioId);
        return Ok(historial);
    }

    [HttpPost]
    public async Task<IActionResult> Enviar(Guid otroUsuarioId, [FromBody] MensajePrivadoCrearDto dto)
    {
        var usuarioId = ObtenerUsuarioId();
        if (usuarioId == null) return Unauthorized();

        try
        {
            var creado = await _service.EnviarAsync(usuarioId.Value, otroUsuarioId, dto);
            return Ok(creado);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }
}