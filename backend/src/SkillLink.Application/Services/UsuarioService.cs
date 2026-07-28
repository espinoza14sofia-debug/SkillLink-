using SkillLink.Application.DTOs;
using SkillLink.Application.Interfaces;

namespace SkillLink.Application.Services
{
    public class UsuarioService : IUsuarioService
    {
        private readonly IUsuarioRepository _usuarioRepository;

        public UsuarioService(IUsuarioRepository usuarioRepository)
        {
            _usuarioRepository = usuarioRepository;
        }

        public async Task ActualizarPerfilAsync(Guid id, ActualizarPerfilDto dto)
        {
            var usuario = await _usuarioRepository.ObtenerPorIdAsync(id);
            if (usuario == null)
                throw new Exception("Usuario no encontrado");

            if (string.IsNullOrWhiteSpace(dto.Nombre))
                throw new Exception("El nombre no puede estar vacío");

            // Actualizamos todos los campos enviados desde el perfil
            usuario.Nombre = dto.Nombre;
            usuario.Carrera = dto.Carrera;
            usuario.Semestre = dto.Semestre;
            usuario.Github = dto.Github;
            usuario.Linkedin = dto.Linkedin;
            usuario.Descripcion = dto.Descripcion;
            usuario.Foto = dto.Foto;

            // Sincronizamos las habilidades si el DTO las trae
            if (dto.HabilidadIds != null)
            {
                await _usuarioRepository.ActualizarHabilidadesUsuarioAsync(usuario.Id, dto.HabilidadIds);
            }

            await _usuarioRepository.GuardarCambiosAsync();
        }

        public async Task<object> ObtenerPerfilPublicoAsync(Guid id)
        {
            var usuario = await _usuarioRepository.ObtenerPorIdAsync(id);
            if (usuario == null)
                return null!;

            return new
            {
                id = usuario.Id,
                nombre = usuario.Nombre,
                foto = usuario.Foto,
                carrera = usuario.Carrera,
                descripcion = usuario.Descripcion,
                nivel = usuario.Nivel,
                xp = usuario.Xp
            };
        }

        public async Task<IEnumerable<object>> ObtenerHabilidadesDeUsuarioAsync(Guid usuarioId)
        {
            var habilidades = await _usuarioRepository.ObtenerHabilidadesDeUsuarioAsync(usuarioId);

            return habilidades.Select(uh => new
            {
                id = uh.Habilidad!.Id,
                nombre = uh.Habilidad.Nombre,
                nivel = uh.Nivel
            });
        }

        public async Task ActualizarHabilidadesUsuarioAsync(Guid usuarioId, List<Guid> habilidadIds)
        {
            await _usuarioRepository.ActualizarHabilidadesUsuarioAsync(usuarioId, habilidadIds);
            await _usuarioRepository.GuardarCambiosAsync();
        }
    }
}