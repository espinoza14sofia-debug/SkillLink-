using Microsoft.EntityFrameworkCore;
using SkillLink.Application.Interfaces;
using SkillLink.Domain.Entities;
using SkillLink.Infrastructure.Persistence;

namespace SkillLink.Infrastructure.Repositories
{
    public class EquipoRepository : IEquipoRepository
    {
        private readonly SkillLinkDbContext _context;

        public EquipoRepository(SkillLinkDbContext context)
        {
            _context = context;
        }

        public async Task<Equipo> CrearEquipoAsync(Equipo equipo)
        {
            _context.Equipos.Add(equipo);
            await _context.SaveChangesAsync();
            return equipo;
        }

        public async Task AgregarMiembroAsync(MiembroEquipo miembro)
        {
            _context.MiembrosEquipo.Add(miembro);
            await _context.SaveChangesAsync();
        }

        public async Task<MiembroEquipo?> ObtenerMiembroAsync(
            Guid equipoId,
            Guid usuarioId)
        {
            return await _context.MiembrosEquipo
                .Include(m => m.Usuario)
                .FirstOrDefaultAsync(
                    m => m.EquipoId == equipoId &&
                         m.UsuarioId == usuarioId
                );
        }

        public async Task<List<MiembroEquipo>> ObtenerMiembrosPorEquipoAsync(
            Guid equipoId)
        {
            return await _context.MiembrosEquipo
                .Include(m => m.Usuario)
                .Where(m => m.EquipoId == equipoId)
                .ToListAsync();
        }

        public async Task<List<Equipo>> ObtenerEquiposPorUsuarioAsync(
            Guid usuarioId)
        {
            return await _context.MiembrosEquipo
                .Where(m => m.UsuarioId == usuarioId)
                .Include(m => m.Equipo)
                .Select(m => m.Equipo!)
                .OrderByDescending(e => e.FechaCreacion)
                .ToListAsync();
        }

        public async Task<bool> CambiarRolAsync(
            Guid equipoId,
            Guid usuarioId,
            RolEquipo nuevoRol)
        {
            var miembro = await ObtenerMiembroAsync(
                equipoId,
                usuarioId
            );

            if (miembro == null)
            {
                return false;
            }

            miembro.Rol = nuevoRol;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> EliminarMiembroAsync(
            Guid equipoId,
            Guid usuarioId)
        {
            var miembro = await ObtenerMiembroAsync(
                equipoId,
                usuarioId
            );

            if (miembro == null)
            {
                return false;
            }

            _context.MiembrosEquipo.Remove(miembro);

            await _context.SaveChangesAsync();

            return true;
        }

        // =========================================================
        // INSIGNIAS
        // Cuenta los equipos donde el usuario es Líder.
        // =========================================================

        public async Task<int> ContarCreadosPorUsuarioAsync(Guid usuarioId)
        {
            return await _context.MiembrosEquipo
                .CountAsync(m =>
                    m.UsuarioId == usuarioId &&
                    m.Rol == RolEquipo.Lider
                );
        }
    }
}