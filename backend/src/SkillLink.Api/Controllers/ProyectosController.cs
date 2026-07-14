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
}