using SkillLink.Application.DTOs;

namespace SkillLink.Application.Interfaces;

public interface IRankingService
{
    Task<List<RankingItemDto>> ObtenerTopAsync(int top = 10);
    Task<RankingItemDto?> ObtenerPosicionAsync(Guid usuarioId);
}