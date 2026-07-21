using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillLink.Application.Interfaces;

namespace SkillLink.Api.Controllers;

[ApiController]
[Route("api/ranking")]
[Authorize]
public class RankingController : ControllerBase
{
    private readonly IRankingService _rankingService;

    public RankingController(IRankingService rankingService)
    {
        _rankingService = rankingService;
    }

    // GET: api/ranking
    [HttpGet]
    public async Task<IActionResult> ObtenerTop([FromQuery] int top = 10)
    {
        var ranking = await _rankingService.ObtenerTopAsync(top);
        return Ok(ranking);
    }

    // GET: api/ranking/mi-posicion
    [HttpGet("mi-posicion")]
    public async Task<IActionResult> ObtenerMiPosicion()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (!Guid.TryParse(userIdClaim, out var usuarioId))
            return Unauthorized();

        var posicion = await _rankingService.ObtenerPosicionAsync(usuarioId);
        if (posicion == null) return NotFound();

        return Ok(posicion);
    }
}