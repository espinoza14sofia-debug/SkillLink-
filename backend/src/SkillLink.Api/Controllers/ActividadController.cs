using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillLink.Application.Interfaces;

namespace SkillLink.Api.Controllers;

[ApiController]
[Route("api/actividad")]
[Authorize]
public class ActividadController : ControllerBase
{
    private readonly IActividadService _actividadService;

    public ActividadController(IActividadService actividadService)
    {
        _actividadService = actividadService;
    }

    private Guid? ObtenerUsuarioId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                           ?? User.FindFirstValue("sub");
        return Guid.TryParse(userIdClaim, out var id) ? id : null;
    }

    // GET: api/actividad
    [HttpGet]
    public async Task<IActionResult> ObtenerRecientes()
    {
        var usuarioId = ObtenerUsuarioId();
        if (usuarioId == null) return Unauthorized();

        var actividades = await _actividadService.ObtenerRecientesAsync(usuarioId.Value);
        return Ok(actividades);
    }
}