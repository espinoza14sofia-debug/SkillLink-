using Microsoft.EntityFrameworkCore;
using SkillLink.Application.Interfaces;
using SkillLink.Domain.Entities;
using SkillLink.Infrastructure.Persistence;
namespace SkillLink.Infrastructure.Repositories;

public class MisionRepository : IMisionRepository
{
    private readonly SkillLinkDbContext _context;
    public MisionRepository(SkillLinkDbContext context)
    {
        _context = context;
    }
    public async Task<List<Mision>> ObtenerTodasAsync()
    {
        return await _context.Misiones
            .Include(m => m.Proyecto)
            .ToListAsync();
    }
    public async Task<List<Mision>> ObtenerPorUsuarioAsync(Guid usuarioId)
    {
        return await _context.Misiones
            .Include(m => m.Proyecto)
            .Where(m => m.UsuarioAsignadoId == usuarioId)
            .ToListAsync();
    }
    public async Task<Mision?> ObtenerPorIdAsync(Guid id)
    {
        return await _context.Misiones
            .Include(m => m.Proyecto)
            .FirstOrDefaultAsync(m => m.Id == id);
    }
    public async Task AgregarAsync(Mision mision)
    {
        await _context.Misiones.AddAsync(mision);
    }
    public async Task<int> ContarCompletadasPorUsuarioAsync(Guid usuarioId)
    {
        return await _context.Misiones
            .CountAsync(m => m.UsuarioAsignadoId == usuarioId && m.Estado == "completada");
    }
    public async Task GuardarCambiosAsync()
    {
        await _context.SaveChangesAsync();
    }
}