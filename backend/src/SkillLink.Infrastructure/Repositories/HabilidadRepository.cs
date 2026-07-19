using Microsoft.EntityFrameworkCore;
using SkillLink.Application.Interfaces;
using SkillLink.Domain.Entities;
using SkillLink.Infrastructure.Persistence;

namespace SkillLink.Infrastructure.Repositories;

public class HabilidadRepository : IHabilidadRepository
{
    private readonly SkillLinkDbContext _context;

    public HabilidadRepository(SkillLinkDbContext context)
    {
        _context = context;
    }

    public async Task<Habilidad?> ObtenerPorNombreAsync(string nombre)
    {
        return await _context.Habilidades
            .FirstOrDefaultAsync(h => h.Nombre.ToLower() == nombre.ToLower());
    }

    public async Task<Habilidad> CrearHabilidadAsync(Habilidad habilidad)
    {
        _context.Habilidades.Add(habilidad);
        await _context.SaveChangesAsync();
        return habilidad;
    }

    public async Task<bool> ExisteUsuarioHabilidadAsync(Guid usuarioId, Guid habilidadId)
    {
        return await _context.UsuarioHabilidades
            .AnyAsync(uh => uh.UsuarioId == usuarioId && uh.HabilidadId == habilidadId);
    }

    public async Task<UsuarioHabilidad?> ObtenerUsuarioHabilidadAsync(Guid usuarioId, Guid habilidadId)
    {
        return await _context.UsuarioHabilidades
            .Include(uh => uh.Habilidad)
            .FirstOrDefaultAsync(uh => uh.UsuarioId == usuarioId && uh.HabilidadId == habilidadId);
    }

    public async Task AgregarUsuarioHabilidadAsync(UsuarioHabilidad usuarioHabilidad)
    {
        _context.UsuarioHabilidades.Add(usuarioHabilidad);
        await _context.SaveChangesAsync();
    }

    public async Task EliminarUsuarioHabilidadAsync(UsuarioHabilidad usuarioHabilidad)
    {
        _context.UsuarioHabilidades.Remove(usuarioHabilidad);
        await _context.SaveChangesAsync();
    }

    public async Task<List<UsuarioHabilidad>> ObtenerPorUsuarioAsync(Guid usuarioId)
    {
        return await _context.UsuarioHabilidades
            .Include(uh => uh.Habilidad)
            .Where(uh => uh.UsuarioId == usuarioId)
            .ToListAsync();
    }

    public async Task GuardarCambiosAsync()
    {
        await _context.SaveChangesAsync();
    }
}