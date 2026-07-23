using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillLink.Application.Interfaces;
using SkillLink.Application.DTOs;

namespace SkillLink.Api.Controllers
{
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

        public UsuariosController(
            IUsuarioRepository usuarioRepository,
            INivelService nivelService,
            ILogroService logroService,
            IMisionRepository misionRepository,
            IUsuarioService usuarioService,
            IRachaService rachaService)
        {
            _usuarioRepository = usuarioRepository;
            _nivelService = nivelService;
            _logroService = logroService;
            _misionRepository = misionRepository;
            _usuarioService = usuarioService;
            _rachaService = rachaService;
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

            // Registra que el usuario tuvo actividad hoy (actualiza su racha de días).
            var racha = await _rachaService.RegistrarActividadAsync(userId);

            var nivelInfo = await _nivelService.CalcularNivelAsync(usuario.Xp);
            var logros = await _logroService.ObtenerLogrosDeUsuarioAsync(userId);
            var misionesCompletadas = await _misionRepository.ContarCompletadasPorUsuarioAsync(userId);

            // Evalúa si con esto desbloqueó algo nuevo.
            var logrosNuevos = await _logroService.EvaluarYOtorgarAsync(userId, nivelInfo.Xp, misionesCompletadas);

            // Obtenemos las habilidades del usuario para incluirlas en la respuesta
            var habilidadesUsuario = await _usuarioService.ObtenerHabilidadesDeUsuarioAsync(userId);

            // Insignias como lista (id, nombre), no solo el conteo — igual que en el perfil público
            var insigniasDesbloqueadas = logros
                .Where(l => l.Desbloqueado)
                .Select(l => new { id = l.Id, nombre = l.Nombre });

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
                habilidades = habilidadesUsuario
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
                return NotFound(new { error = "Usuario no encontrado" });
            }

            var habilidadesUsuario = await _usuarioService.ObtenerHabilidadesDeUsuarioAsync(id);
            var nivelInfo = await _nivelService.CalcularNivelAsync(usuario.Xp);
            var logros = await _logroService.ObtenerLogrosDeUsuarioAsync(id);
            var misionesCompletadas = await _misionRepository.ContarCompletadasPorUsuarioAsync(id);

            // Solo insignias que el usuario realmente desbloqueó, con id y nombre
            var insigniasDesbloqueadas = logros
                .Where(l => l.Desbloqueado)
                .Select(l => new { id = l.Id, nombre = l.Nombre });

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
                racha = usuario.RachaActual,           // viene directo de la entidad, sin registrar actividad
                fechaRegistro = usuario.FechaRegistro, // ya existía en la entidad, solo faltaba exponerla
                misionesCompletadas = misionesCompletadas,
                insignias = insigniasDesbloqueadas,    // ahora es un array, no un contador
                habilidades = habilidadesUsuario
            });
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

        // POST: api/usuarios/{id}/habilidades
        [HttpPost("{id}/habilidades")]
        [Authorize]
        public async Task<IActionResult> ActualizarHabilidades(Guid id, [FromBody] ActualizarHabilidadesDto dto)
        {
            try
            {
                if (dto?.HabilidadIds == null)
                {
                    return BadRequest(new { error = "La lista de habilidades no puede ser nula." });
                }

                await _usuarioService.ActualizarHabilidadesUsuarioAsync(id, dto.HabilidadIds);

                return Ok(new
                {
                    mensaje = "Habilidades actualizadas correctamente"
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
}