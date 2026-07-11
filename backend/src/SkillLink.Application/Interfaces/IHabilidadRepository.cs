using SkillLink.Domain.Entities;

namespace SkillLink.Application.Interfaces;

public interface IHabilidadRepository
{
    Task<Habilidad?> ObtenerPorNombreAsync(string nombre);
    Task<Habilidad> CrearHabilidadAsync(Habilidad habilidad);
    Task<bool> ExisteUsuarioHabilidadAsync(Guid usuarioId, Guid habilidadId);
    Task AgregarUsuarioHabilidadAsync(UsuarioHabilidad usuarioHabilidad);
    Task<List<UsuarioHabilidad>> ObtenerPorUsuarioAsync(Guid usuarioId);
    Task GuardarCambiosAsync();
}