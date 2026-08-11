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

        // Antes: solo hacía _context.Usuarios.Remove(usuario), lo cual falla con
        // DbUpdateException apenas el usuario tiene FKs con DeleteBehavior.Restrict
        // (MiembroEquipo, MensajePrivado, InvitacionEquipo). Ahora se borran esas
        // relaciones a mano, en orden, antes de borrar el Usuario. El resto de
        // tablas (UsuarioHabilidades, Notificaciones, PushSubscriptions, UsuarioLogros)
        // están configuradas con Cascade y EF/la BD las borra solas.
        public async Task EliminarAsync(Usuario usuario)
        {
            var usuarioId = usuario.Id;

            // 1. Membresías de equipo (Restrict) — el usuario deja los equipos
            var membresias = await _context.MiembrosEquipo
                .Where(m => m.UsuarioId == usuarioId)
                .ToListAsync();
            _context.MiembrosEquipo.RemoveRange(membresias);

            // 2. Mensajes privados enviados o recibidos (Restrict en ambos lados)
            var mensajesPrivados = await _context.MensajesPrivados
                .Where(m => m.EmisorId == usuarioId || m.ReceptorId == usuarioId)
                .ToListAsync();
            _context.MensajesPrivados.RemoveRange(mensajesPrivados);

            // 3. Invitaciones a equipos, como invitado o como quien invita (Restrict)
            var invitaciones = await _context.InvitacionesEquipo
                .Where(i => i.UsuarioInvitadoId == usuarioId || i.UsuarioInvitaId == usuarioId)
                .ToListAsync();
            _context.InvitacionesEquipo.RemoveRange(invitaciones);

            // 4. Actividad reciente — se borra explícitamente por seguridad, ya que
            //    su relación con Usuario no tiene un OnDelete configurado en el DbContext.
            //    Confirmar en ActividadReciente.cs si esto es necesario o si ya cascada.
            var actividades = await _context.Actividades
                .Where(a => a.UsuarioId == usuarioId)
                .ToListAsync();
            _context.Actividades.RemoveRange(actividades);

            // 5. Finalmente, el usuario. UsuarioHabilidades, Notificaciones,
            //    PushSubscriptions y UsuarioLogros se borran solos por Cascade.
            _context.Usuarios.Remove(usuario);
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