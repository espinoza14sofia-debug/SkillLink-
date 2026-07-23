using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillLink.Application.DTOs;
using SkillLink.Application.Interfaces;

namespace SkillLink.Api.Controllers
{
    [ApiController]
    [Route("api/habilidades")]
    public class HabilidadesController : ControllerBase
    {
        private readonly IHabilidadService _habilidadService;

        public HabilidadesController(IHabilidadService habilidadService)
        {
            _habilidadService = habilidadService;
        }

        // POST: api/habilidades/usuario/{id}
        [HttpPost("usuario/{id}")]
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

        // GET: api/habilidades/usuario/{id}
        [HttpGet("usuario/{id}")]
        [Authorize]
        public async Task<IActionResult> ObtenerHabilidades(Guid id)
        {
            var habilidades = await _habilidadService.ObtenerHabilidadesDeUsuarioAsync(id);
            return Ok(habilidades);
        }

        // PUT: api/habilidades/usuario/{id}/{habilidadId}
        [HttpPut("usuario/{id}/{habilidadId}")]
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

        // DELETE: api/habilidades/usuario/{id}/{habilidadId}
        [HttpDelete("usuario/{id}/{habilidadId}")]
        [Authorize]
        public async Task<IActionResult> EliminarHabilidad(Guid id, Guid habilidadId)
        {
            try
            {
                await _habilidadService.EliminarHabilidadAsync(id, habilidadId);
                return Ok(new { mensaje = "Habilidad eliminada correctamente" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}