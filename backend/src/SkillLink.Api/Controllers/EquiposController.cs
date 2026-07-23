using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillLink.Application.DTOs;
using SkillLink.Application.Interfaces;
using System.Security.Claims;

namespace SkillLink.Api.Controllers;

[ApiController]
[Route("api/equipos")]
[Authorize]
public class EquiposController : ControllerBase
{
    private readonly IEquipoService _equipoService;
    private readonly IInvitacionService _invitacionService;

    public EquiposController(IEquipoService equipoService, IInvitacionService invitacionService)
    {
        _equipoService = equipoService;
        _invitacionService = invitacionService;
    }

    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] CrearEquipoDto dto)
    {
        var usuarioId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var equipoId = await _equipoService.CrearEquipoAsync(dto, usuarioId);
        return CreatedAtAction(nameof(ObtenerMiembros), new { id = equipoId }, new { id = equipoId });
    }

    [HttpGet("mios")]
    public async Task<IActionResult> ObtenerMisEquipos()
    {
        var usuarioId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var equipos = await _equipoService.ObtenerMisEquiposAsync(usuarioId);
        return Ok(equipos);
    }

    [HttpGet("{id}/miembros")]
    public async Task<IActionResult> ObtenerMiembros(Guid id)
    {
        var miembros = await _equipoService.ObtenerMiembrosAsync(id);
        return Ok(miembros);
    }

    [HttpPut("{id}/miembros/{usuarioId}/rol")]
    public async Task<IActionResult> CambiarRol(Guid id, Guid usuarioId, [FromBody] CambiarRolDto dto)
    {
        var solicitanteId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var resultado = await _equipoService.CambiarRolMiembroAsync(id, usuarioId, dto.NuevoRol, solicitanteId);

        if (!resultado)
            return Forbid();

        return NoContent();
    }

    [HttpPost("{id}/invitar")]
    public async Task<IActionResult> Invitar(Guid id, [FromBody] InvitarUsuarioDto dto)
    {
        var usuarioId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        try
        {
            await _invitacionService.InvitarAsync(id, dto, usuarioId);
            return Ok(new { mensaje = "Invitación enviada correctamente." });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }

    [HttpDelete("{id}/salir")]
    public async Task<IActionResult> SalirDelEquipo(Guid id)
    {
        var usuarioId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        try
        {
            var resultado = await _equipoService.SalirDelEquipoAsync(id, usuarioId);
            if (!resultado) return NotFound();
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }

    [HttpGet("invitaciones/pendientes")]
    public async Task<IActionResult> ObtenerMisInvitaciones()
    {
        var usuarioId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var invitaciones = await _invitacionService.ObtenerMisInvitacionesAsync(usuarioId);
        return Ok(invitaciones);
    }

    [HttpPut("invitaciones/{invitacionId}/responder")]
    public async Task<IActionResult> ResponderInvitacion(Guid invitacionId, [FromBody] ResponderInvitacionDto dto)
    {
        var usuarioId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        try
        {
            var resultado = await _invitacionService.ResponderAsync(invitacionId, dto.Aceptar, usuarioId);
            if (!resultado) return NotFound();
            return Ok(new { mensaje = dto.Aceptar ? "Invitación aceptada." : "Invitación rechazada." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }
}