using Microsoft.EntityFrameworkCore;
using SkillLink.Domain.Entities;

namespace SkillLink.Infrastructure.Persistence
{
    public class SkillLinkDbContext : DbContext
    {
        public SkillLinkDbContext(DbContextOptions<SkillLinkDbContext> options)
            : base(options)
        {
        }

        public DbSet<Usuario> Usuarios => Set<Usuario>();
        public DbSet<NivelConfiguracion> NivelConfiguraciones => Set<NivelConfiguracion>();
        public DbSet<Mision> Misiones => Set<Mision>();
        public DbSet<Logro> Logros => Set<Logro>();
        public DbSet<UsuarioLogro> UsuarioLogros => Set<UsuarioLogro>();
        public DbSet<Habilidad> Habilidades { get; set; }
        public DbSet<UsuarioHabilidad> UsuarioHabilidades { get; set; }
        public DbSet<TokenRecuperacion> TokensRecuperacion { get; set; }
        public DbSet<Equipo> Equipos => Set<Equipo>();
        public DbSet<MiembroEquipo> MiembrosEquipo => Set<MiembroEquipo>();
        public DbSet<Proyecto> Proyectos => Set<Proyecto>();
        public DbSet<Mensaje> Mensajes => Set<Mensaje>();
        public DbSet<MensajePrivado> MensajesPrivados => Set<MensajePrivado>();
        public DbSet<Notificacion> Notificaciones => Set<Notificacion>();
        public DbSet<ActividadReciente> Actividades => Set<ActividadReciente>();
        public DbSet<InvitacionEquipo> InvitacionesEquipo => Set<InvitacionEquipo>();
        public DbSet<PushSubscription> PushSubscriptions => Set<PushSubscription>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<TokenRecuperacion>(entity =>
            {
                entity.HasKey(t => t.Id);
                entity.Property(t => t.Token).IsRequired();
                entity.HasIndex(t => t.Token).IsUnique();
            });

            modelBuilder.Entity<Usuario>(entity =>
            {
                entity.HasKey(u => u.Id);
                entity.Property(u => u.Nombre).IsRequired().HasMaxLength(150);
                entity.Property(u => u.Email).IsRequired().HasMaxLength(200);
                entity.HasIndex(u => u.Email).IsUnique();
                entity.Property(u => u.PasswordHash).IsRequired();
                entity.Property(u => u.Carrera).HasMaxLength(150);
                entity.Property(u => u.FechaRegistro).IsRequired();
            });

            modelBuilder.Entity<NivelConfiguracion>(entity =>
            {
                entity.HasKey(n => n.Id);
                entity.Property(n => n.Titulo).IsRequired().HasMaxLength(50);

                entity.HasData(
                    new NivelConfiguracion { Id = 1, Nivel = 1, Titulo = "Novato", XpMinimo = 0 },
                    new NivelConfiguracion { Id = 2, Nivel = 5, Titulo = "Colaborador", XpMinimo = 400 },
                    new NivelConfiguracion { Id = 3, Nivel = 10, Titulo = "Estratega", XpMinimo = 900 },
                    new NivelConfiguracion { Id = 4, Nivel = 20, Titulo = "Líder", XpMinimo = 1900 },
                    new NivelConfiguracion { Id = 5, Nivel = 30, Titulo = "Maestro", XpMinimo = 2900 }
                );
            });

            modelBuilder.Entity<Mision>(entity =>
            {
                entity.HasKey(m => m.Id);
                entity.Property(m => m.Titulo).IsRequired().HasMaxLength(200);
                entity.Property(m => m.Estado).IsRequired().HasMaxLength(20);
                entity.Property(m => m.FechaCreacion).IsRequired();
                entity.Property(m => m.Etiquetas).HasMaxLength(300);

                entity.HasOne(m => m.Proyecto)
                    .WithMany()
                    .HasForeignKey(m => m.ProyectoId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<Logro>(entity =>
            {
                entity.HasKey(l => l.Id);

                entity.Property(l => l.Nombre)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(l => l.Descripcion)
                    .HasMaxLength(300);

                entity.Property(l => l.TipoCondicion)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(l => l.ValorCondicion)
                    .IsRequired();

                entity.HasData(

                    // =========================================================
                    // XP TOTAL
                    // =========================================================

                    new Logro
                    {
                        Id = Guid.Parse("10000000-0000-0000-0000-000000000001"),
                        Nombre = "Primeros pasos",
                        Descripcion = "Alcanza 50 XP.",
                        TipoCondicion = "xp_total",
                        ValorCondicion = 50
                    },

                    new Logro
                    {
                        Id = Guid.Parse("10000000-0000-0000-0000-000000000002"),
                        Nombre = "Aprendiz",
                        Descripcion = "Alcanza 100 XP.",
                        TipoCondicion = "xp_total",
                        ValorCondicion = 100
                    },

                    new Logro
                    {
                        Id = Guid.Parse("10000000-0000-0000-0000-000000000003"),
                        Nombre = "Colaborador",
                        Descripcion = "Alcanza 250 XP.",
                        TipoCondicion = "xp_total",
                        ValorCondicion = 250
                    },

                    new Logro
                    {
                        Id = Guid.Parse("10000000-0000-0000-0000-000000000004"),
                        Nombre = "Experto",
                        Descripcion = "Alcanza 500 XP.",
                        TipoCondicion = "xp_total",
                        ValorCondicion = 500
                    },

                    new Logro
                    {
                        Id = Guid.Parse("10000000-0000-0000-0000-000000000005"),
                        Nombre = "Maestro del equipo",
                        Descripcion = "Alcanza 1000 XP.",
                        TipoCondicion = "xp_total",
                        ValorCondicion = 1000
                    },


                    // =========================================================
                    // MISIONES COMPLETADAS
                    // =========================================================

                    new Logro
                    {
                        Id = Guid.Parse("20000000-0000-0000-0000-000000000001"),
                        Nombre = "Recién llegado",
                        Descripcion = "Completa tu primera misión.",
                        TipoCondicion = "misiones_completadas",
                        ValorCondicion = 1
                    },

                    new Logro
                    {
                        Id = Guid.Parse("20000000-0000-0000-0000-000000000002"),
                        Nombre = "En marcha",
                        Descripcion = "Completa 5 misiones.",
                        TipoCondicion = "misiones_completadas",
                        ValorCondicion = 5
                    },

                    new Logro
                    {
                        Id = Guid.Parse("20000000-0000-0000-0000-000000000003"),
                        Nombre = "Misionero",
                        Descripcion = "Completa 10 misiones.",
                        TipoCondicion = "misiones_completadas",
                        ValorCondicion = 10
                    },

                    new Logro
                    {
                        Id = Guid.Parse("20000000-0000-0000-0000-000000000004"),
                        Nombre = "Especialista en misiones",
                        Descripcion = "Completa 25 misiones.",
                        TipoCondicion = "misiones_completadas",
                        ValorCondicion = 25
                    },

                    new Logro
                    {
                        Id = Guid.Parse("20000000-0000-0000-0000-000000000005"),
                        Nombre = "Leyenda de las misiones",
                        Descripcion = "Completa 50 misiones.",
                        TipoCondicion = "misiones_completadas",
                        ValorCondicion = 50
                    },


                    // =========================================================
                    // PROYECTOS CREADOS
                    // =========================================================

                    new Logro
                    {
                        Id = Guid.Parse("30000000-0000-0000-0000-000000000001"),
                        Nombre = "Primer proyecto",
                        Descripcion = "Crea tu primer proyecto.",
                        TipoCondicion = "proyectos_creados",
                        ValorCondicion = 1
                    },

                    new Logro
                    {
                        Id = Guid.Parse("30000000-0000-0000-0000-000000000002"),
                        Nombre = "Constructor",
                        Descripcion = "Crea 3 proyectos.",
                        TipoCondicion = "proyectos_creados",
                        ValorCondicion = 3
                    },

                    new Logro
                    {
                        Id = Guid.Parse("30000000-0000-0000-0000-000000000003"),
                        Nombre = "Creador de proyectos",
                        Descripcion = "Crea 5 proyectos.",
                        TipoCondicion = "proyectos_creados",
                        ValorCondicion = 5
                    },

                    new Logro
                    {
                        Id = Guid.Parse("30000000-0000-0000-0000-000000000004"),
                        Nombre = "Gestor de proyectos",
                        Descripcion = "Crea 10 proyectos.",
                        TipoCondicion = "proyectos_creados",
                        ValorCondicion = 10
                    },

                    new Logro
                    {
                        Id = Guid.Parse("30000000-0000-0000-0000-000000000005"),
                        Nombre = "Arquitecto",
                        Descripcion = "Crea 20 proyectos.",
                        TipoCondicion = "proyectos_creados",
                        ValorCondicion = 20
                    },


                    // =========================================================
                    // EQUIPOS CREADOS
                    // =========================================================

                    new Logro
                    {
                        Id = Guid.Parse("40000000-0000-0000-0000-000000000001"),
                        Nombre = "Fundador",
                        Descripcion = "Crea tu primer equipo.",
                        TipoCondicion = "equipos_creados",
                        ValorCondicion = 1
                    },

                    new Logro
                    {
                        Id = Guid.Parse("40000000-0000-0000-0000-000000000002"),
                        Nombre = "Organizador",
                        Descripcion = "Crea 3 equipos.",
                        TipoCondicion = "equipos_creados",
                        ValorCondicion = 3
                    },

                    new Logro
                    {
                        Id = Guid.Parse("40000000-0000-0000-0000-000000000003"),
                        Nombre = "Líder de equipos",
                        Descripcion = "Crea 5 equipos.",
                        TipoCondicion = "equipos_creados",
                        ValorCondicion = 5
                    },

                    new Logro
                    {
                        Id = Guid.Parse("40000000-0000-0000-0000-000000000004"),
                        Nombre = "Coordinador",
                        Descripcion = "Crea 10 equipos.",
                        TipoCondicion = "equipos_creados",
                        ValorCondicion = 10
                    },

                    new Logro
                    {
                        Id = Guid.Parse("40000000-0000-0000-0000-000000000005"),
                        Nombre = "Líder nato",
                        Descripcion = "Crea 20 equipos.",
                        TipoCondicion = "equipos_creados",
                        ValorCondicion = 20
                    },


                    // =========================================================
                    // HABILIDADES REGISTRADAS
                    // =========================================================

                    new Logro
                    {
                        Id = Guid.Parse("50000000-0000-0000-0000-000000000001"),
                        Nombre = "Primera habilidad",
                        Descripcion = "Registra tu primera habilidad.",
                        TipoCondicion = "habilidades_registradas",
                        ValorCondicion = 1
                    },

                    new Logro
                    {
                        Id = Guid.Parse("50000000-0000-0000-0000-000000000002"),
                        Nombre = "Multitalento",
                        Descripcion = "Registra 3 habilidades.",
                        TipoCondicion = "habilidades_registradas",
                        ValorCondicion = 3
                    },

                    new Logro
                    {
                        Id = Guid.Parse("50000000-0000-0000-0000-000000000003"),
                        Nombre = "Versátil",
                        Descripcion = "Registra 5 habilidades.",
                        TipoCondicion = "habilidades_registradas",
                        ValorCondicion = 5
                    },

                    new Logro
                    {
                        Id = Guid.Parse("50000000-0000-0000-0000-000000000004"),
                        Nombre = "Especialista",
                        Descripcion = "Registra 8 habilidades.",
                        TipoCondicion = "habilidades_registradas",
                        ValorCondicion = 8
                    },

                    new Logro
                    {
                        Id = Guid.Parse("50000000-0000-0000-0000-000000000005"),
                        Nombre = "Polímata",
                        Descripcion = "Registra 12 habilidades.",
                        TipoCondicion = "habilidades_registradas",
                        ValorCondicion = 12
                    },


                    // =========================================================
                    // MENSAJES ENVIADOS
                    // =========================================================

                    new Logro
                    {
                        Id = Guid.Parse("60000000-0000-0000-0000-000000000001"),
                        Nombre = "Hola equipo",
                        Descripcion = "Envía tu primer mensaje.",
                        TipoCondicion = "mensajes_enviados",
                        ValorCondicion = 1
                    },

                    new Logro
                    {
                        Id = Guid.Parse("60000000-0000-0000-0000-000000000002"),
                        Nombre = "Comunicador",
                        Descripcion = "Envía 10 mensajes.",
                        TipoCondicion = "mensajes_enviados",
                        ValorCondicion = 10
                    },

                    new Logro
                    {
                        Id = Guid.Parse("60000000-0000-0000-0000-000000000003"),
                        Nombre = "Conversador",
                        Descripcion = "Envía 50 mensajes.",
                        TipoCondicion = "mensajes_enviados",
                        ValorCondicion = 50
                    },

                    new Logro
                    {
                        Id = Guid.Parse("60000000-0000-0000-0000-000000000004"),
                        Nombre = "Comunicador experto",
                        Descripcion = "Envía 100 mensajes.",
                        TipoCondicion = "mensajes_enviados",
                        ValorCondicion = 100
                    },

                    new Logro
                    {
                        Id = Guid.Parse("60000000-0000-0000-0000-000000000005"),
                        Nombre = "Maestro de la comunicación",
                        Descripcion = "Envía 250 mensajes.",
                        TipoCondicion = "mensajes_enviados",
                        ValorCondicion = 250
                    }
                );
            });

            modelBuilder.Entity<UsuarioLogro>(entity =>
            {
                entity.HasKey(ul => new { ul.UsuarioId, ul.LogroId });

                entity.HasOne(ul => ul.Logro)
                    .WithMany()
                    .HasForeignKey(ul => ul.LogroId);
            });

            modelBuilder.Entity<Habilidad>(entity =>
            {
                entity.HasKey(h => h.Id);
                entity.Property(h => h.Nombre).IsRequired().HasMaxLength(100);
            });

            // Configuración directa por entidad intermedia sin colecciones inversas para evitar columnas fantasma
            modelBuilder.Entity<UsuarioHabilidad>(entity =>
            {
                entity.HasKey(uh => new { uh.UsuarioId, uh.HabilidadId });
                entity.ToTable("UsuarioHabilidades");

                entity.HasOne(uh => uh.Usuario)
                      .WithMany(u => u.UsuarioHabilidades)
                      .HasForeignKey(uh => uh.UsuarioId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(uh => uh.Habilidad)
                      .WithMany()
                      .HasForeignKey(uh => uh.HabilidadId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Equipo>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Nombre).IsRequired().HasMaxLength(150);
                entity.Property(e => e.FechaCreacion).IsRequired();
            });

            modelBuilder.Entity<MiembroEquipo>(entity =>
            {
                entity.HasKey(m => m.Id);
                entity.Property(m => m.Rol).IsRequired();
                entity.Property(m => m.FechaIngreso).IsRequired();

                entity.HasIndex(m => new { m.EquipoId, m.UsuarioId }).IsUnique();

                entity.HasOne(m => m.Equipo)
                    .WithMany(e => e.Miembros)
                    .HasForeignKey(m => m.EquipoId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(m => m.Usuario)
                    .WithMany()
                    .HasForeignKey(m => m.UsuarioId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Proyecto>(entity =>
            {
                entity.HasKey(p => p.Id);
                entity.Property(p => p.Nombre).IsRequired().HasMaxLength(150);
                entity.Property(p => p.Estado).IsRequired();
                entity.Property(p => p.FechaCreacion).IsRequired();

                entity.HasOne(p => p.Equipo)
                    .WithMany()
                    .HasForeignKey(p => p.EquipoId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ActividadReciente>(entity =>
            {
                entity.HasKey(a => a.Id);
                entity.Property(a => a.Texto).IsRequired().HasMaxLength(300);
                entity.Property(a => a.Fecha).IsRequired();

                entity.HasIndex(a => new { a.UsuarioId, a.Fecha });
            });

            modelBuilder.Entity<Mensaje>(entity =>
            {
                entity.HasKey(m => m.Id);
                entity.Property(m => m.Contenido).IsRequired().HasMaxLength(1000);
                entity.Property(m => m.Fecha).IsRequired();

                entity.HasIndex(m => new { m.EquipoId, m.Fecha });

                entity.HasOne(m => m.Equipo)
                    .WithMany()
                    .HasForeignKey(m => m.EquipoId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<MensajePrivado>(entity =>
            {
                entity.HasKey(m => m.Id);
                entity.Property(m => m.Contenido).IsRequired().HasMaxLength(1000);
                entity.Property(m => m.Fecha).IsRequired();

                entity.HasIndex(m => new { m.EmisorId, m.ReceptorId, m.Fecha });

                entity.HasOne(m => m.Emisor)
                    .WithMany()
                    .HasForeignKey(m => m.EmisorId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(m => m.Receptor)
                    .WithMany()
                    .HasForeignKey(m => m.ReceptorId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Notificacion>(entity =>
            {
                entity.HasKey(n => n.Id);
                entity.Property(n => n.Tipo).IsRequired().HasMaxLength(50);
                entity.Property(n => n.Mensaje).IsRequired().HasMaxLength(500);
                entity.Property(n => n.Fecha).IsRequired();

                entity.HasIndex(n => new { n.UsuarioId, n.Leida });

                entity.HasOne(n => n.Usuario)
                    .WithMany()
                    .HasForeignKey(n => n.UsuarioId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<InvitacionEquipo>(entity =>
            {
                entity.HasKey(i => i.Id);
                entity.Property(i => i.Estado).IsRequired();
                entity.Property(i => i.FechaCreacion).IsRequired();

                entity.HasOne(i => i.Equipo)
                    .WithMany()
                    .HasForeignKey(i => i.EquipoId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(i => i.UsuarioInvitado)
                    .WithMany()
                    .HasForeignKey(i => i.UsuarioInvitadoId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(i => i.UsuarioInvita)
                    .WithMany()
                    .HasForeignKey(i => i.UsuarioInvitaId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<PushSubscription>(entity =>
            {
                entity.HasKey(p => p.Id);
                entity.Property(p => p.Endpoint).IsRequired().HasMaxLength(500);
                entity.Property(p => p.P256dh).IsRequired().HasMaxLength(200);
                entity.Property(p => p.Auth).IsRequired().HasMaxLength(200);
                entity.Property(p => p.FechaCreacion).IsRequired();

                entity.HasIndex(p => p.Endpoint).IsUnique();

                entity.HasOne(p => p.Usuario)
                    .WithMany()
                    .HasForeignKey(p => p.UsuarioId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}