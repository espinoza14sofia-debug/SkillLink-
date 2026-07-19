using Microsoft.EntityFrameworkCore;
using SkillLink.Application.Interfaces;
using SkillLink.Domain.Entities;
using SkillLink.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Text;

namespace SkillLink.Infrastructure.Repositories;

public class ProyectoRepository : IProyectoRepository
{
    private readonly SkillLinkDbContext _context;

    public ProyectoRepository(SkillLinkDbContext context)
    {
        _context = context;
    }

    public async Task<Proyecto?> ObtenerPorIdAsync(Guid id)
    {
        return await _context.Proyectos.FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Proyecto> CrearAsync(Proyecto proyecto)
    {
        _context.Proyectos.Add(proyecto);
        await _context.SaveChangesAsync();
        return proyecto;
    }

    public async Task<bool> UsuarioPerteneceAlEquipoAsync(Guid equipoId, Guid usuarioId)
    {
        return await _context.MiembrosEquipo
            .AnyAsync(m => m.EquipoId == equipoId && m.UsuarioId == usuarioId);
    }

    // en Misiones hay que poner ProyectoId
    public async Task<double> CalcularPorcentajeAvanceAsync(Guid proyectoId)
    {
        return await Task.FromResult(0.0); // placeholder temporal
    }

    public async Task<List<Proyecto>> ObtenerPorUsuarioAsync(Guid usuarioId)
    {
        var equipoIds = await _context.MiembrosEquipo
            .Where(m => m.UsuarioId == usuarioId)
            .Select(m => m.EquipoId)
            .ToListAsync();

        return await _context.Proyectos
            .Where(p => equipoIds.Contains(p.EquipoId))
            .OrderByDescending(p => p.FechaCreacion)
            .ToListAsync();
    }
}