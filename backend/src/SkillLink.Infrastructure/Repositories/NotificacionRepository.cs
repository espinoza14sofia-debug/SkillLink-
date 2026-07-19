using Microsoft.EntityFrameworkCore;
using SkillLink.Application.Interfaces;
using SkillLink.Domain.Entities;
using SkillLink.Infrastructure.Persistence;

namespace SkillLink.Infrastructure.Repositories;

public class NotificacionRepository : INotificacionRepository
{
    private readonly SkillLinkDbContext _context;

    public NotificacionRepository(SkillLinkDbContext context)
    {
        _context = context;
    }

    public async Task<List<Notificacion>> ObtenerPorUsuarioAsync(Guid usuarioId)
    {
        return await _context.Notificaciones
            .Where(n => n.UsuarioId == usuarioId)
            .OrderByDescending(n => n.Fecha)
            .Take(50)
            .ToListAsync();
    }

    public async Task<int> ContarNoLeidasAsync(Guid usuarioId)
    {
        return await _context.Notificaciones
            .CountAsync(n => n.UsuarioId == usuarioId && !n.Leida);
    }

    public async Task AgregarAsync(Notificacion notificacion)
    {
        await _context.Notificaciones.AddAsync(notificacion);
    }

    public async Task<Notificacion?> ObtenerPorIdAsync(Guid id)
    {
        return await _context.Notificaciones.FirstOrDefaultAsync(n => n.Id == id);
    }

    public async Task MarcarTodasComoLeidasAsync(Guid usuarioId)
    {
        await _context.Notificaciones
            .Where(n => n.UsuarioId == usuarioId && !n.Leida)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.Leida, true));
    }

    public async Task GuardarCambiosAsync()
    {
        await _context.SaveChangesAsync();
    }
}