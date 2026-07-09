using Microsoft.EntityFrameworkCore;
using SkillLink.Application.Interfaces;
using SkillLink.Domain.Entities;
using SkillLink.Infrastructure.Persistence;

namespace SkillLink.Infrastructure.Repositories;

public class LogroRepository : ILogroRepository
{
    private readonly SkillLinkDbContext _context;

    public LogroRepository(SkillLinkDbContext context)
    {
        _context = context;
    }

    public async Task<List<Logro>> ObtenerTodosAsync()
    {
        return await _context.Logros.ToListAsync();
    }

    public async Task<List<UsuarioLogro>> ObtenerPorUsuarioAsync(Guid usuarioId)
    {
        return await _context.UsuarioLogros
            .Include(ul => ul.Logro)
            .Where(ul => ul.UsuarioId == usuarioId)
            .ToListAsync();
    }

    public async Task<bool> YaTieneLogroAsync(Guid usuarioId, Guid logroId)
    {
        return await _context.UsuarioLogros
            .AnyAsync(ul => ul.UsuarioId == usuarioId && ul.LogroId == logroId);
    }

    public async Task OtorgarAsync(UsuarioLogro usuarioLogro)
    {
        await _context.UsuarioLogros.AddAsync(usuarioLogro);
    }

    public async Task GuardarCambiosAsync()
    {
        await _context.SaveChangesAsync();
    }
}