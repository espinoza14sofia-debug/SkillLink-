using Microsoft.EntityFrameworkCore;
using SkillLink.Application.Interfaces;
using SkillLink.Domain.Entities;
using SkillLink.Infrastructure.Persistence;

namespace SkillLink.Infrastructure.Repositories;

public class MensajePrivadoRepository : IMensajePrivadoRepository
{
    private readonly SkillLinkDbContext _context;

    public MensajePrivadoRepository(SkillLinkDbContext context)
    {
        _context = context;
    }

    public async Task<List<MensajePrivado>> ObtenerConversacionAsync(Guid usuarioId, Guid otroUsuarioId)
    {
        return await _context.MensajesPrivados
            .Include(m => m.Emisor)
            .Where(m =>
                (m.EmisorId == usuarioId && m.ReceptorId == otroUsuarioId) ||
                (m.EmisorId == otroUsuarioId && m.ReceptorId == usuarioId))
            .OrderBy(m => m.Fecha)
            .ToListAsync();
    }

    public async Task<List<MensajePrivado>> ObtenerNuevosAsync(Guid usuarioId, Guid otroUsuarioId, DateTime desde)
    {
        return await _context.MensajesPrivados
            .Include(m => m.Emisor)
            .Where(m =>
                ((m.EmisorId == usuarioId && m.ReceptorId == otroUsuarioId) ||
                 (m.EmisorId == otroUsuarioId && m.ReceptorId == usuarioId)) &&
                m.Fecha > desde)
            .OrderBy(m => m.Fecha)
            .ToListAsync();
    }

    public async Task AgregarAsync(MensajePrivado mensaje)
    {
        await _context.MensajesPrivados.AddAsync(mensaje);
    }

    public async Task GuardarCambiosAsync()
    {
        await _context.SaveChangesAsync();
    }
}