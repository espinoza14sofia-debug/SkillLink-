using Microsoft.EntityFrameworkCore;
using SkillLink.Application.Interfaces;
using SkillLink.Domain.Entities;
using SkillLink.Infrastructure.Persistence;

namespace SkillLink.Infrastructure.Repositories;

public class InvitacionRepository : IInvitacionRepository
{
    private readonly SkillLinkDbContext _context;

    public InvitacionRepository(SkillLinkDbContext context)
    {
        _context = context;
    }

    public async Task<InvitacionEquipo?> ObtenerPorIdAsync(Guid id)
    {
        return await _context.InvitacionesEquipo
            .Include(i => i.Equipo)
            .Include(i => i.UsuarioInvita)
            .FirstOrDefaultAsync(i => i.Id == id);
    }

    public async Task<InvitacionEquipo?> ObtenerPendienteAsync(Guid equipoId, Guid usuarioInvitadoId)
    {
        return await _context.InvitacionesEquipo
            .FirstOrDefaultAsync(i =>
                i.EquipoId == equipoId &&
                i.UsuarioInvitadoId == usuarioInvitadoId &&
                i.Estado == EstadoInvitacion.Pendiente);
    }

    public async Task<List<InvitacionEquipo>> ObtenerPendientesPorUsuarioAsync(Guid usuarioId)
    {
        return await _context.InvitacionesEquipo
            .Include(i => i.Equipo)
            .Include(i => i.UsuarioInvita)
            .Where(i => i.UsuarioInvitadoId == usuarioId && i.Estado == EstadoInvitacion.Pendiente)
            .ToListAsync();
    }

    public async Task CrearAsync(InvitacionEquipo invitacion)
    {
        _context.InvitacionesEquipo.Add(invitacion);
        await _context.SaveChangesAsync();
    }

    public async Task GuardarCambiosAsync()
    {
        await _context.SaveChangesAsync();
    }
}