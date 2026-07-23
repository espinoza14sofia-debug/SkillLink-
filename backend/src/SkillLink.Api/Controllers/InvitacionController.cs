using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillLink.Application.DTOs;
using SkillLink.Application.Interfaces;

[Route("api/equipos")]
[ApiController]
[Authorize]
public class InvitacionController : ControllerBase
{
    private readonly IInvitacionService _invitacionService;

    public InvitacionController(IInvitacionService invitacionService)
    {
        _invitacionService = invitacionService;
    }

    private Guid ObtenerUsuarioId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub") ?? User.FindFirst("id");
        if (claim != null && Guid.TryParse(claim.Value, out var usuarioId))
        {
            return usuarioId;
        }
        throw new UnauthorizedAccessException("No se pudo identificar al usuario autenticado.");
    }

    [HttpPost("{equipoId}/invitaciones")]
    public async Task<IActionResult> Invitar(Guid equipoId, [FromBody] InvitarUsuarioDto dto)
    {
        var usuarioInvitaId = ObtenerUsuarioId();
        await _invitacionService.InvitarAsync(equipoId, dto, usuarioInvitaId);
        return Ok(new { message = "Invitación enviada correctamente." });
    }

    [HttpGet("invitaciones/mis-invitaciones")]
    public async Task<IActionResult> ObtenerMisInvitaciones()
    {
        var usuarioId = ObtenerUsuarioId();
        var invitaciones = await _invitacionService.ObtenerMisInvitacionesAsync(usuarioId);
        return Ok(invitaciones);
    }

    [HttpPost("invitaciones/{invitacionId}/responder")]
    public async Task<IActionResult> Responder(Guid invitacionId, [FromBody] ResponderInvitacionDto dto)
    {
        var usuarioId = ObtenerUsuarioId();
        var resultado = await _invitacionService.ResponderAsync(invitacionId, dto.Aceptar, usuarioId);
        if (!resultado) return BadRequest(new { message = "No se pudo procesar la respuesta." });
        return Ok(new { message = dto.Aceptar ? "Invitación aceptada con éxito." : "Invitación rechazada." });
    }
}

public class ResponderInvitacionDto
{
    public bool Aceptar { get; set; }
}