using Microsoft.EntityFrameworkCore;
using SkillLink.Application.Interfaces;
using SkillLink.Domain.Entities;
using SkillLink.Infrastructure.Persistence;

namespace SkillLink.Infrastructure.Repositories;

public class RankingRepository : IRankingRepository
{
    private readonly SkillLinkDbContext _context;

    public RankingRepository(SkillLinkDbContext context)
    {
        _context = context;
    }

    public async Task<List<Usuario>> ObtenerTodosOrdenadosPorXpAsync()
    {
        return await _context.Usuarios
            .OrderByDescending(u => u.Xp)
            .ToListAsync();
    }
}