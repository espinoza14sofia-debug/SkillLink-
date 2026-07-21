using SkillLink.Domain.Entities;

namespace SkillLink.Application.Interfaces;

public interface IRankingRepository
{
    Task<List<Usuario>> ObtenerTodosOrdenadosPorXpAsync();
}