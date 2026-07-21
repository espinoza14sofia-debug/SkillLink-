using SkillLink.Application.DTOs;
using SkillLink.Application.Interfaces;

namespace SkillLink.Application.Services;

public class RankingService : IRankingService
{
    private readonly IRankingRepository _rankingRepository;

    public RankingService(IRankingRepository rankingRepository)
    {
        _rankingRepository = rankingRepository;
    }

    public async Task<List<RankingItemDto>> ObtenerTopAsync(int top = 10)
    {
        var usuarios = await _rankingRepository.ObtenerTodosOrdenadosPorXpAsync();

        return usuarios
            .Take(top)
            .Select((u, index) => new RankingItemDto
            {
                UsuarioId = u.Id,
                Nombre = u.Nombre,
                Xp = u.Xp,
                Nivel = u.Nivel,
                Posicion = index + 1,
                Carrera = u.Carrera
            })
            .ToList();
    }

    public async Task<RankingItemDto?> ObtenerPosicionAsync(Guid usuarioId)
    {
        var usuarios = await _rankingRepository.ObtenerTodosOrdenadosPorXpAsync();

        var index = usuarios.FindIndex(u => u.Id == usuarioId);
        if (index == -1) return null;

        var usuario = usuarios[index];

        return new RankingItemDto
        {
            UsuarioId = usuario.Id,
            Nombre = usuario.Nombre,
            Xp = usuario.Xp,
            Nivel = usuario.Nivel,
            Posicion = index + 1,
            Carrera = usuario.Carrera
        };
    }
}