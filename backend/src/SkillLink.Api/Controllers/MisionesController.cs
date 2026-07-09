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

    // GET: api/misiones
    [HttpGet]
    public async Task<IActionResult> ObtenerTodas()
    {
        var misiones = await _misionService.ObtenerTodasAsync();
        return Ok(misiones);
    }

    // GET: api/misiones/mias
    [HttpGet("mias")]
    public async Task<IActionResult> ObtenerMisPropias()
    {
        var usuarioId = ObtenerUsuarioId();
        if (usuarioId == null) return Unauthorized();

        var misiones = await _misionService.ObtenerPorUsuarioAsync(usuarioId.Value);
        return Ok(misiones);
    }

    // POST: api/misiones
    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] MisionCrearDto dto)
    {
        var mision = await _misionService.CrearAsync(dto);
        return CreatedAtAction(nameof(ObtenerTodas), new { id = mision.Id }, mision);
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