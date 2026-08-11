using SkillLink.Domain.Entities;

namespace SkillLink.Application.Interfaces
{
    public interface IUsuarioRepository
    {
        Task<Usuario?> ObtenerPorEmailAsync(string email);
        Task<Usuario?> ObtenerPorIdAsync(Guid id);
        Task<bool> ExisteEmailAsync(string email);
        Task<List<Usuario>> ObtenerTodosAsync();
        Task AgregarAsync(Usuario usuario);
        Task<IEnumerable<UsuarioHabilidad>> ObtenerHabilidadesDeUsuarioAsync(Guid usuarioId);
        Task ActualizarHabilidadesUsuarioAsync(Guid usuarioId, List<Guid> habilidadIds);
        Task GuardarCambiosAsync();
        Task EliminarAsync(Usuario usuario);
    }
}