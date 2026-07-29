using Microsoft.EntityFrameworkCore;
using SkillLink.Application.Interfaces;
using SkillLink.Domain.Entities;
using SkillLink.Infrastructure.Persistence;

namespace SkillLink.Infrastructure.Repositories;

public class PushSubscriptionRepository : IPushSubscriptionRepository
{
    private readonly SkillLinkDbContext _context;

    public PushSubscriptionRepository(SkillLinkDbContext context)
    {
        _context = context;
    }

    public async Task GuardarOActualizarAsync(PushSubscription suscripcion)
    {
        var existente = await _context.PushSubscriptions
            .FirstOrDefaultAsync(p => p.Endpoint == suscripcion.Endpoint);

        if (existente != null)
        {
            existente.UsuarioId = suscripcion.UsuarioId;
            existente.P256dh = suscripcion.P256dh;
            existente.Auth = suscripcion.Auth;
        }
        else
        {
            _context.PushSubscriptions.Add(suscripcion);
        }

        await _context.SaveChangesAsync();
    }

    public async Task<List<PushSubscription>> ObtenerPorUsuarioAsync(Guid usuarioId)
    {
        return await _context.PushSubscriptions
            .Where(p => p.UsuarioId == usuarioId)
            .ToListAsync();
    }

    public async Task EliminarPorEndpointAsync(string endpoint)
    {
        var existente = await _context.PushSubscriptions
            .FirstOrDefaultAsync(p => p.Endpoint == endpoint);

        if (existente != null)
        {
            _context.PushSubscriptions.Remove(existente);
            await _context.SaveChangesAsync();
        }
    }
}