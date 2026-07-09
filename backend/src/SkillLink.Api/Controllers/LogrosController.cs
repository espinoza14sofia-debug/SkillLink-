using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillLink.Application.Interfaces;

namespace SkillLink.Api.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public class LogrosController : ControllerBase
{
    private readonly ILogroService _logroService;

    public LogrosController(ILogroService logroService)
    {
        _logroService = logroService;
    }

    // GET: api/usuarios/{id}/logros
    [HttpGet("usuarios/{id}/logros")]
    public async Task<IActionResult> ObtenerLogros(Guid id)
    {
        var logros = await _logroService.ObtenerLogrosDeUsuarioAsync(id);
        return Ok(logros);
    }

    // GET: api/logros/mis
    [HttpGet("logros/mis")]
    public async Task<IActionResult> ObtenerMisLogros()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                           ?? User.FindFirstValue("sub");

        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var logros = await _logroService.ObtenerLogrosDeUsuarioAsync(userId);
        return Ok(logros);
    }
}