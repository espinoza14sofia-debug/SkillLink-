using Microsoft.EntityFrameworkCore;
using SkillLink.Application.Interfaces;
using SkillLink.Domain.Entities;
using SkillLink.Infrastructure.Persistence;

namespace SkillLink.Infrastructure.Repositories;

public class MensajeRepository : IMensajeRepository
{
    private readonly SkillLinkDbContext _context;

    public MensajeRepository(SkillLinkDbContext context)
    {
        _context = context;
    }

    public async Task<List<Mensaje>> ObtenerPorEquipoAsync(Guid equipoId)
    {
        return await _context.Mensajes
            .Include(m => m.Emisor)
            .Where(m => m.EquipoId == equipoId)
            .OrderBy(m => m.Fecha)
            .ToListAsync();
    }

    public async Task<List<Mensaje>> ObtenerNuevosAsync(Guid equipoId, DateTime desde)
    {
        return await _context.Mensajes
            .Include(m => m.Emisor)
            .Where(m => m.EquipoId == equipoId && m.Fecha > desde)
            .OrderBy(m => m.Fecha)
            .ToListAsync();
    }

    public async Task AgregarAsync(Mensaje mensaje)
    {
        await _context.Mensajes.AddAsync(mensaje);
    }

    public async Task GuardarCambiosAsync()
    {
        await _context.SaveChangesAsync();
    }
}