using SkillLink.Application.DTOs;

namespace SkillLink.Application.Interfaces;

public interface INivelService
{
    Task<NivelInfoDto> CalcularNivelAsync(int xp);
}