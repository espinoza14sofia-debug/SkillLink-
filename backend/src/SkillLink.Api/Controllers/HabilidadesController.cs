using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillLink.Application.DTOs;
using SkillLink.Application.Interfaces;

namespace SkillLink.Api.Controllers;

[ApiController]
[Route("api/usuarios")]
public class HabilidadesController : ControllerBase
{
    private readonly IHabilidadService _habilidadService;

    public HabilidadesController(IHabilidadService habilidadService)
    {
        _habilidadService = habilidadService;
    }

    // POST: api/usuarios/{id}/habilidades
    [HttpPost("{id}/habilidades")]
    [Authorize]
    public async Task<IActionResult> AgregarHabilidad(Guid id, [FromBody] HabilidadCrearDto dto)
    {
        try
        {
            var resultado = await _habilidadService.AgregarHabilidadAsync(id, dto);
            return Ok(resultado);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    // GET: api/usuarios/{id}/habilidades
    [HttpGet("{id}/habilidades")]
    [Authorize]
    public async Task<IActionResult> ObtenerHabilidades(Guid id)
    {
        var habilidades = await _habilidadService.ObtenerHabilidadesDeUsuarioAsync(id);
        return Ok(habilidades);
    }

    // PUT: api/usuarios/{id}/habilidades/{habilidadId}
    [HttpPut("{id}/habilidades/{habilidadId}")]
    [Authorize]
    public async Task<IActionResult> ActualizarNivelHabilidad(
        Guid id,
        Guid habilidadId,
        [FromBody] ActualizarNivelHabilidadDto dto)
    {
        try
        {
            var resultado = await _habilidadService.ActualizarNivelHabilidadAsync(id, habilidadId, dto);
            return Ok(resultado);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}