using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillLink.Application.DTOs;
using SkillLink.Application.Interfaces;

namespace SkillLink.Api.Controllers;

[ApiController]
[Route("api/xp")]
[Authorize]
public class XpController : ControllerBase
{
    private readonly IXpService _xpService;

    public XpController(IXpService xpService)
    {
        _xpService = xpService;
    }

    // POST: api/xp/otorgar
    [HttpPost("otorgar")]
    public async Task<IActionResult> Otorgar([FromBody] OtorgarXpDto dto)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                           ?? User.FindFirstValue("sub");

        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        try
        {
            var resultado = await _xpService.OtorgarXpAsync(userId, dto.Cantidad);
            return Ok(resultado);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { mensaje = ex.Message });
        }
    }
}