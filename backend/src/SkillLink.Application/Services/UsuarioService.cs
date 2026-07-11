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

        public async Task<bool> ActualizarPerfilAsync(Guid id, ActualizarPerfilDto dto)
        {
            var usuario = await _usuarioRepository.ObtenerPorIdAsync(id);
            if (usuario == null)
                throw new Exception("Usuario no encontrado");

            if (string.IsNullOrWhiteSpace(dto.Nombre))
                throw new Exception("El nombre no puede estar vacío");

            usuario.Nombre = dto.Nombre;
            usuario.Carrera = dto.Carrera;
            usuario.Foto = dto.Foto;

            await _usuarioRepository.GuardarCambiosAsync();
            return true;


        }
        public async Task<PerfilPublicoDto?> ObtenerPerfilPublicoAsync(Guid id)
        {
            var usuario = await _usuarioRepository.ObtenerPorIdAsync(id);
            if (usuario == null)
                return null;

            return new PerfilPublicoDto
            {
                Id = usuario.Id,
                Nombre = usuario.Nombre,
                Foto = usuario.Foto,
                Nivel = usuario.Nivel,
                Xp = usuario.Xp
            };
        }

    }
}