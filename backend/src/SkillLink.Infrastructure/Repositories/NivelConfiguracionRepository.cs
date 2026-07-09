using Microsoft.EntityFrameworkCore;
using SkillLink.Application.Interfaces;
using SkillLink.Domain.Entities;
using SkillLink.Infrastructure.Persistence;

namespace SkillLink.Infrastructure.Repositories;

public class NivelConfiguracionRepository : INivelConfiguracionRepository
{
    private readonly SkillLinkDbContext _context;

    public NivelConfiguracionRepository(SkillLinkDbContext context)
    {
        _context = context;
    }

    public async Task<List<NivelConfiguracion>> ObtenerTodosAsync()
    {
        return await _context.NivelConfiguraciones.ToListAsync();
    }
}