using Microsoft.AspNetCore.Mvc;
using SkillLink.Application.DTOs;
using SkillLink.Application.Interfaces;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace SkillLink.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    // POST: api/auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] UsuarioRegistroDto dto)
    {
        var resultado = await _authService.RegistrarAsync(dto);

        if (!resultado.Exito)
        {
            return BadRequest(new { mensaje = resultado.Error });
        }

        return CreatedAtAction(
            nameof(Register),
            new { id = resultado.Usuario!.Id },
            resultado.Usuario
        );
    }

    // POST: api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var resultado = await _authService.LoginAsync(dto);

        if (!resultado.Exito)
        {
            return Unauthorized(new { mensaje = resultado.Error });
        }

        return Ok(resultado.Resultado);
    }

    // POST: api/auth/recuperar-password
    [HttpPost("recuperar-password")]
    public async Task<IActionResult> RecuperarPassword([FromBody] SolicitarRecuperacionDto dto)
    {
        var resultado = await _authService.SolicitarRecuperacionAsync(dto);

        if (!resultado.Exito)
        {
            return BadRequest(new { mensaje = resultado.Error });
        }

        return Ok(new { mensaje = "Si el email existe, se enviaron instrucciones de recuperación." });
    }

    // POST: api/auth/cambiar-password
    [HttpPost("cambiar-password")]
    [Authorize]
    public async Task<IActionResult> CambiarPassword([FromBody] CambiarPasswordDto dto)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");

        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var usuarioId))
        {
            return Unauthorized();
        }

        var resultado = await _authService.CambiarPasswordAsync(usuarioId, dto);

        if (!resultado.Exito)
        {
            return BadRequest(new { mensaje = resultado.Error });
        }

        return Ok(new { mensaje = "Contraseña actualizada correctamente." });
    }

    // POST: api/auth/restablecer-password
    [HttpPost("restablecer-password")]
    public async Task<IActionResult> RestablecerPassword([FromBody] RestablecerPasswordDto dto)
    {
        var resultado = await _authService.RestablecerPasswordAsync(dto);

        if (!resultado.Exito)
        {
            return BadRequest(new { mensaje = resultado.Error });
        }

        return Ok(new { mensaje = "Contraseña restablecida correctamente." });
    }
}