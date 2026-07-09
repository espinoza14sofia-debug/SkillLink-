using SkillLink.Application.DTOs;
using SkillLink.Application.Interfaces;

namespace SkillLink.Application.Services;

public class NivelService : INivelService
{
    private readonly INivelConfiguracionRepository _repository;

    public NivelService(INivelConfiguracionRepository repository)
    {
        _repository = repository;
    }

    public async Task<NivelInfoDto> CalcularNivelAsync(int xp)
    {
        var configuraciones = await _repository.ObtenerTodosAsync();

        // Nivel: cada 100 XP sube un nivel
        var nivel = (xp / 100) + 1;

        // Título: el de mayor XpMinimo que el usuario ya alcanzó
        var titulo = configuraciones
            .Where(c => xp >= c.XpMinimo)
            .OrderByDescending(c => c.XpMinimo)
            .Select(c => c.Titulo)
            .FirstOrDefault() ?? "Novato";

        var xpProximoNivel = nivel * 100;
        var xpRestante = Math.Max(xpProximoNivel - xp, 0);
        var xpDelNivelActual = xp % 100;
        var progreso = (xpDelNivelActual / 100.0) * 100;

        return new NivelInfoDto
        {
            Nivel = nivel,
            Titulo = titulo,
            Xp = xp,
            XpProximoNivel = xpProximoNivel,
            XpRestante = xpRestante,
            Progreso = progreso
        };
    }
}