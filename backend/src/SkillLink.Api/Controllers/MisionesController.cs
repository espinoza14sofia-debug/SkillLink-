using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillLink.Application.DTOs;
using SkillLink.Application.Interfaces;

namespace SkillLink.Api.Controllers;

[ApiController]
[Route("api/misiones")]
[Authorize]
public class MisionesController : ControllerBase
{
    private readonly IMisionService _misionService;

    public MisionesController(IMisionService misionService)
    {
        _misionService = misionService;
    }

    private Guid? ObtenerUsuarioId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                           ?? User.FindFirstValue("sub");
        return Guid.TryParse(userIdClaim, out var id) ? id : null;
    }

    // GET: api/misiones (Devuelve las misiones del usuario autenticado)
    [HttpGet]
    public async Task<IActionResult> ObtenerMisPropias()
    {
        var usuarioId = ObtenerUsuarioId();
        if (usuarioId == null) return Unauthorized();

        var misiones = await _misionService.ObtenerPorUsuarioAsync(usuarioId.Value);
        return Ok(misiones);
    }

    // GET: api/misiones/todas
    [HttpGet("todas")]
    public async Task<IActionResult> ObtenerTodas()
    {
        var misiones = await _misionService.ObtenerTodasAsync();
        return Ok(misiones);
    }

    // GET: api/misiones/equipo/{equipoId}
    [HttpGet("equipo/{equipoId}")]
    public async Task<IActionResult> ObtenerPorEquipo(Guid equipoId)
    {
        var misiones = await _misionService.ObtenerPorEquipoAsync(equipoId);
        return Ok(misiones);
    }

    // POST: api/misiones
    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] MisionCrearDto dto)
    {
        var usuarioId = ObtenerUsuarioId();
        if (usuarioId == null) return Unauthorized();

        if (dto.UsuarioAsignadoId == null || dto.UsuarioAsignadoId == Guid.Empty)
        {
            dto.UsuarioAsignadoId = usuarioId.Value;
        }

        var mision = await _misionService.CrearAsync(dto);
        return CreatedAtAction(nameof(ObtenerMisPropias), new { id = mision.Id }, mision);
    }

    // PUT: api/misiones/{id}/asignar
    [HttpPut("{id}/asignar")]
    public async Task<IActionResult> AsignarAMi(Guid id)
    {
        var usuarioId = ObtenerUsuarioId();
        if (usuarioId == null) return Unauthorized();

        try
        {
            var mision = await _misionService.AsignarAsync(id, usuarioId.Value);
            return Ok(mision);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { mensaje = ex.Message });
        }
    }

    // PUT: api/misiones/{id}/completar
    [HttpPut("{id}/completar")]
    public async Task<IActionResult> Completar(Guid id)
    {
        var usuarioId = ObtenerUsuarioId();
        if (usuarioId == null) return Unauthorized();

        try
        {
            var mision = await _misionService.CompletarAsync(id, usuarioId.Value);
            return Ok(mision);
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

    // PUT: api/misiones/{id}/reasignar
    [HttpPut("{id}/reasignar")]
    public async Task<IActionResult> Reasignar(Guid id, [FromBody] ReasignarDto dto)
    {
        var usuarioActualId = ObtenerUsuarioId();
        if (usuarioActualId == null) return Unauthorized();

        try
        {
            var resultado = await _misionService.ReasignarAsync(id, usuarioActualId.Value, dto.NuevoUsuarioId);
            return Ok(resultado);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    // PUT: api/misiones/{id}/progreso
    [HttpPut("{id}/progreso")]
    public async Task<IActionResult> ActualizarProgreso(Guid id, [FromBody] ActualizarProgresoDto dto)
    {
        var usuarioId = ObtenerUsuarioId();
        if (usuarioId == null) return Unauthorized();

        try
        {
            var mision = await _misionService.ActualizarProgresoAsync(id, usuarioId.Value, dto.Progreso);
            return Ok(mision);
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
}