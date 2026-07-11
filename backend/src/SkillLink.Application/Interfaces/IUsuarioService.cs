using SkillLink.Application.DTOs;

namespace SkillLink.Application.Interfaces
{
    public interface IUsuarioService
    {
        Task<bool> ActualizarPerfilAsync(Guid id, ActualizarPerfilDto dto);
        Task<PerfilPublicoDto?> ObtenerPerfilPublicoAsync(Guid id);
    }
}