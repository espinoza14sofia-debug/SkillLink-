using SkillLink.Domain.Entities;

namespace SkillLink.Application.Interfaces;

public interface IMisionRepository
{
    Task<List<Mision>> ObtenerTodasAsync();
    Task<List<Mision>> ObtenerPorUsuarioAsync(Guid usuarioId);
    Task<Mision?> ObtenerPorIdAsync(Guid id);
    Task<int> ContarCompletadasPorUsuarioAsync(Guid usuarioId);
    Task AgregarAsync(Mision mision);
    Task GuardarCambiosAsync();
    Task<List<Mision>> ObtenerPorEquipoAsync(Guid equipoId);
    Task<List<Mision>> ObtenerPorProyectoAsync(Guid proyectoId);
}