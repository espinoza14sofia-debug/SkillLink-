using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
    private readonly IRachaService _rachaService;
    private readonly IEquipoRepository _equipoRepository;

    public UsuariosController(
        IUsuarioRepository usuarioRepository,
        INivelService nivelService,
        ILogroService logroService,
        IMisionRepository misionRepository,
        IUsuarioService usuarioService,
        IRachaService rachaService,
        IEquipoRepository equipoRepository)
    {
        _usuarioRepository = usuarioRepository;
        _nivelService = nivelService;
        _logroService = logroService;
        _misionRepository = misionRepository;
        _usuarioService = usuarioService;
        _rachaService = rachaService;
        _equipoRepository = equipoRepository;
    }

    private Guid? ObtenerUsuarioId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                           ?? User.FindFirstValue("sub");

        return Guid.TryParse(userIdClaim, out var id) ? id : null;
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

        // Registra que el usuario tuvo actividad hoy.
        var racha = await _rachaService.RegistrarActividadAsync(userId);

        var nivelInfo = await _nivelService.CalcularNivelAsync(usuario.Xp);
        var logros = await _logroService.ObtenerLogrosDeUsuarioAsync(userId);
        var misionesCompletadas =
            await _misionRepository.ContarCompletadasPorUsuarioAsync(userId);

        // Evalúa si el usuario desbloqueó alguna insignia nueva.
        var logrosNuevos =
            await _logroService.EvaluarYOtorgarAsync(userId);

        // Habilidades del usuario.
        var habilidadesUsuario =
            await _usuarioService.ObtenerHabilidadesDeUsuarioAsync(userId);

        // Todos los equipos a los que pertenece el usuario.
        var equipos =
            await _equipoRepository.ObtenerEquiposPorUsuarioAsync(userId);

        var equiposDto = equipos
            .Select(e => new
            {
                id = e.Id,
                nombre = e.Nombre
            })
            .ToList();

        // Insignias desbloqueadas.
        var insigniasDesbloqueadas = logros
            .Where(l => l.Desbloqueado)
            .Select(l => new
            {
                id = l.Id,
                nombre = l.Nombre
            });

        return Ok(new
        {
            id = usuario.Id,
            nombre = usuario.Nombre,
            email = usuario.Email,
            carrera = usuario.Carrera,
            semestre = usuario.Semestre,
            github = usuario.Github,
            linkedin = usuario.Linkedin,
            descripcion = usuario.Descripcion,
            foto = usuario.Foto,
            nivel = nivelInfo.Nivel,
            titulo = nivelInfo.Titulo,
            xp = nivelInfo.Xp,
            xpProximoNivel = nivelInfo.XpProximoNivel,
            xpRestante = nivelInfo.XpRestante,
            progreso = nivelInfo.Progreso,
            fechaRegistro = usuario.FechaRegistro,
            insignias = insigniasDesbloqueadas,
            misionesCompletadas = misionesCompletadas,
            rachaActual = racha,
            logrosNuevos = logrosNuevos,
            habilidades = habilidadesUsuario,
            equipos = equiposDto
        });
    }

    // GET: api/usuarios
    [HttpGet]
    [Authorize]
    public async Task<IActionResult> ObtenerTodos()
    {
        var usuarios = await _usuarioRepository.ObtenerTodosAsync();

        var resultado = usuarios.Select(u => new
        {
            id = u.Id,
            nombre = u.Nombre
        });

        return Ok(resultado);
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
        var usuario = await _usuarioRepository.ObtenerPorIdAsync(id);

        if (usuario == null)
        {
            return NotFound(new
            {
                error = "Usuario no encontrado"
            });
        }

        var habilidadesUsuario =
            await _usuarioService.ObtenerHabilidadesDeUsuarioAsync(id);

        var nivelInfo =
            await _nivelService.CalcularNivelAsync(usuario.Xp);

        var logros =
            await _logroService.ObtenerLogrosDeUsuarioAsync(id);

        var misionesCompletadas =
            await _misionRepository.ContarCompletadasPorUsuarioAsync(id);

        var insigniasDesbloqueadas = logros
            .Where(l => l.Desbloqueado)
            .Select(l => new
            {
                id = l.Id,
                nombre = l.Nombre
            });

        return Ok(new
        {
            id = usuario.Id,
            nombre = usuario.Nombre,
            email = usuario.Email,
            carrera = usuario.Carrera,
            semestre = usuario.Semestre,
            github = usuario.Github,
            linkedin = usuario.Linkedin,
            descripcion = usuario.Descripcion,
            foto = usuario.Foto,
            nivel = nivelInfo.Nivel,
            titulo = nivelInfo.Titulo,
            xp = nivelInfo.Xp,
            racha = usuario.RachaActual,
            fechaRegistro = usuario.FechaRegistro,
            misionesCompletadas = misionesCompletadas,
            insignias = insigniasDesbloqueadas,
            habilidades = habilidadesUsuario
        });
    }

    // PUT: api/usuarios/{id}
    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> ActualizarPerfil(
        Guid id,
        [FromBody] ActualizarPerfilDto dto)
    {
        var usuarioActualId = ObtenerUsuarioId();

        if (usuarioActualId == null)
        {
            return Unauthorized();
        }

        // Un usuario solo puede editar su propio perfil.
        if (usuarioActualId.Value != id)
        {
            return Forbid();
        }

        try
        {
            await _usuarioService.ActualizarPerfilAsync(id, dto);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new
            {
                mensaje = ex.Message
            });
        }

        var perfilActualizado =
            await _usuarioService.ObtenerPerfilPublicoAsync(id);

        return Ok(perfilActualizado);
    }

    // DELETE: api/usuarios/{id}
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> EliminarCuenta(Guid id)
    {
        var usuarioActualId = ObtenerUsuarioId();

        if (usuarioActualId == null)
        {
            return Unauthorized();
        }

        // Un usuario solo puede eliminar su propia cuenta.
        if (usuarioActualId.Value != id)
        {
            return Forbid();
        }

        var usuario = await _usuarioRepository.ObtenerPorIdAsync(id);

        if (usuario == null)
        {
            return NotFound(new
            {
                error = "Usuario no encontrado"
            });
        }

        try
        {
            await _usuarioRepository.EliminarAsync(usuario);
            await _usuarioRepository.GuardarCambiosAsync();
        }
        catch (DbUpdateException)
        {
            return StatusCode(500, new
            {
                error = "No se pudo eliminar la cuenta por datos relacionados pendientes."
            });
        }

        return NoContent();
    }
}