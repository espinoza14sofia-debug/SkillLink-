using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillLink.Application.Interfaces;

namespace SkillLink.Api.Controllers;

[ApiController]
[Route("api/usuarios")]
public class UsuariosController : ControllerBase
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly INivelService _nivelService;
    private readonly ILogroService _logroService;
    private readonly IMisionRepository _misionRepository;

    public UsuariosController(
        IUsuarioRepository usuarioRepository,
        INivelService nivelService,
        ILogroService logroService,
        IMisionRepository misionRepository)
    {
        _usuarioRepository = usuarioRepository;
        _nivelService = nivelService;
        _logroService = logroService;
        _misionRepository = misionRepository;
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
}