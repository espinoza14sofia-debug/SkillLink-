using Microsoft.EntityFrameworkCore;
using SkillLink.Application.Interfaces;
using SkillLink.Domain.Entities;
using SkillLink.Infrastructure.Persistence;

namespace SkillLink.Infrastructure.Repositories;

public class ActividadRepository : IActividadRepository
{
    private readonly SkillLinkDbContext _context;

    public ActividadRepository(SkillLinkDbContext context)
    {
        _context = context;
    }

    public async Task AgregarAsync(ActividadReciente actividad)
    {
        await _context.Actividades.AddAsync(actividad);
    }

    public async Task<List<ActividadReciente>> ObtenerRecientesPorUsuarioAsync(Guid usuarioId, int cantidad = 10)
    {
        return await _context.Actividades
            .Where(a => a.UsuarioId == usuarioId)
            .OrderByDescending(a => a.Fecha)
            .Take(cantidad)
            .ToListAsync();
    }

    public async Task GuardarCambiosAsync()
    {
        await _context.SaveChangesAsync();
    }
}