using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillLink.Application.DTOs;
using SkillLink.Application.Interfaces;
using System.Security.Claims;

namespace SkillLink.Api.Controllers;

[ApiController]
[Route("api/proyectos")]
[Authorize]
public class ProyectosController : ControllerBase
{
    private readonly IProyectoService _proyectoService;

    public ProyectosController(IProyectoService proyectoService)
    {
        _proyectoService = proyectoService;
    }

    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] ProyectoCrearDto dto)
    {
        var usuarioId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        try
        {
            var creado = await _proyectoService.CrearProyectoAsync(dto, usuarioId);
            return CreatedAtAction(nameof(ObtenerDetalle), new { id = creado.Id }, creado);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpGet("mios")]
    public async Task<IActionResult> ObtenerMisProyectos()
    {
        var usuarioId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var proyectos = await _proyectoService.ObtenerMisProyectosAsync(usuarioId);
        return Ok(proyectos);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> ObtenerDetalle(Guid id)
    {
        var usuarioId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        try
        {
            var detalle = await _proyectoService.ObtenerDetalleAsync(id, usuarioId);
            if (detalle == null) return NotFound();
            return Ok(detalle);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    // GET: api/proyectos/equipo/{equipoId}
    [HttpGet("equipo/{equipoId}")]
    public async Task<IActionResult> ObtenerPorEquipo(Guid equipoId)
    {
        var usuarioId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        try
        {
            var proyectos = await _proyectoService.ObtenerPorEquipoAsync(equipoId, usuarioId);
            return Ok(proyectos);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }
}