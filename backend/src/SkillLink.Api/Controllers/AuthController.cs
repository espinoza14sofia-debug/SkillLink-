using Microsoft.AspNetCore.Mvc;
using SkillLink.Application.DTOs;
using SkillLink.Application.Interfaces;

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
    public async Task<IActionResult> Register([FromBody] RegistroUsuarioDto dto)
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
}