using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillLink.Application.Interfaces;
using SkillLink.Application.DTOs;

namespace SkillLink.Api.Controllers;

[ApiController]
[Route("api/usuarios")]
public class UsuariosController : ControllerBase
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly INivelService _nivelService;
    private readonly ILogroService _logroService;
    private readonly IMisionRepository _misionRepository;
    private readonly IUsuarioService _usuarioService;

    public UsuariosController(
        IUsuarioRepository usuarioRepository,
        INivelService nivelService,
        ILogroService logroService,
        IMisionRepository misionRepository,
        IUsuarioService usuarioService)
    {
        _usuarioRepository = usuarioRepository;
        _nivelService = nivelService;
        _logroService = logroService;
        _misionRepository = misionRepository;
        _usuarioService = usuarioService;
    }

    // GET: api/usuarios/me
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                           ?? User.FindFirstValue("sub");

        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var usuario = await _usuarioRepository.ObtenerPorIdAsync(userId);

        if (usuario == null)
        {
            return NotFound();
        }

        var nivelInfo = await _nivelService.CalcularNivelAsync(usuario.Xp);
        var logros = await _logroService.ObtenerLogrosDeUsuarioAsync(userId);
        var misionesCompletadas = await _misionRepository.ContarCompletadasPorUsuarioAsync(userId);

        return Ok(new
        {
            id = usuario.Id,
            nombre = usuario.Nombre,
            email = usuario.Email,
            carrera = usuario.Carrera,
            nivel = nivelInfo.Nivel,
            titulo = nivelInfo.Titulo,
            xp = nivelInfo.Xp,
            xpProximoNivel = nivelInfo.XpProximoNivel,
            xpRestante = nivelInfo.XpRestante,
            progreso = nivelInfo.Progreso,
            insigniasDesbloqueadas = logros.Count(l => l.Desbloqueado),
            misionesCompletadas = misionesCompletadas
        });
    }

    // GET: api/usuarios/{id}/nivel
    [HttpGet("{id}/nivel")]
    public async Task<IActionResult> ObtenerNivel(Guid id)
    {
        var usuario = await _usuarioRepository.ObtenerPorIdAsync(id);

        if (usuario == null)
        {
            return NotFound();
        }

        var nivelInfo = await _nivelService.CalcularNivelAsync(usuario.Xp);

        return Ok(nivelInfo);
    }

    // GET: api/usuarios/{id}/perfil
    [HttpGet("{id}/perfil")]
    [Authorize]
    public async Task<IActionResult> ObtenerPerfilPublico(Guid id)
    {
        var perfil = await _usuarioService.ObtenerPerfilPublicoAsync(id);
        if (perfil == null)
            return NotFound(new { error = "Usuario no encontrado" });

        return Ok(perfil);
    }

    // PUT: api/usuarios/{id}
    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> ActualizarPerfil(Guid id, [FromBody] ActualizarPerfilDto dto)
    {
        try
        {
            await _usuarioService.ActualizarPerfilAsync(id, dto);

            return Ok(new
            {
                mensaje = "Perfil actualizado correctamente"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                error = ex.Message
            });
        }
    }
}