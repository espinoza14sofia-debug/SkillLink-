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

    public EquiposController(IEquipoService equipoService)
    {
        _equipoService = equipoService;
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
}
