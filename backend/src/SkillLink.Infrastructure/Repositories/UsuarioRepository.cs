using Microsoft.EntityFrameworkCore;
using SkillLink.Application.Interfaces;
using SkillLink.Domain.Entities;
using SkillLink.Infrastructure.Persistence;

namespace SkillLink.Infrastructure.Repositories
{
    public class UsuarioRepository : IUsuarioRepository
    {
        private readonly SkillLinkDbContext _context;

        public UsuarioRepository(SkillLinkDbContext context)
        {
            _context = context;
        }

        public async Task<Usuario?> ObtenerPorEmailAsync(string email)
        {
            return await _context.Usuarios.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<Usuario?> ObtenerPorIdAsync(Guid id)
        {
            return await _context.Usuarios.FindAsync(id);
        }

        public async Task<List<Usuario>> ObtenerTodosAsync()
        {
            return await _context.Usuarios.ToListAsync();
        }

        public async Task<bool> ExisteEmailAsync(string email)
        {
            return await _context.Usuarios.AnyAsync(u => u.Email == email);
        }

        public async Task AgregarAsync(Usuario usuario)
        {
            await _context.Usuarios.AddAsync(usuario);
        }

        public async Task<IEnumerable<UsuarioHabilidad>> ObtenerHabilidadesDeUsuarioAsync(Guid usuarioId)
        {
            var habilidades = await _context.UsuarioHabilidades
                .Where(uh => uh.UsuarioId == usuarioId)
                .Include(uh => uh.Habilidad)
                .ToListAsync();

            return habilidades;
        }

        public async Task ActualizarHabilidadesUsuarioAsync(Guid usuarioId, List<Guid> habilidadIds)
        {
            var relacionesActuales = await _context.UsuarioHabilidades
                .Where(uh => uh.UsuarioId == usuarioId)
                .ToListAsync();

            _context.UsuarioHabilidades.RemoveRange(relacionesActuales);

            foreach (var habilidadId in habilidadIds)
            {
                var nuevaRelacion = new UsuarioHabilidad
                {
                    UsuarioId = usuarioId,
                    HabilidadId = habilidadId,
                    Nivel = "Básico"
                };
                await _context.UsuarioHabilidades.AddAsync(nuevaRelacion);
            }
        }

        public async Task GuardarCambiosAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}