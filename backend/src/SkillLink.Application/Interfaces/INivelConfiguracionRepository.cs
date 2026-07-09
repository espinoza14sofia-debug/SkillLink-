using SkillLink.Domain.Entities;

namespace SkillLink.Application.Interfaces;

public interface INivelConfiguracionRepository
{
    Task<List<NivelConfiguracion>> ObtenerTodosAsync();
}