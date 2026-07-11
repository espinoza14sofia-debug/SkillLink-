using Microsoft.EntityFrameworkCore;
using SkillLink.Domain.Entities;

namespace SkillLink.Infrastructure.Persistence;

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
        });

        modelBuilder.Entity<Logro>(entity =>
        {
            entity.HasKey(l => l.Id);
            entity.Property(l => l.Nombre).IsRequired().HasMaxLength(100);
            entity.Property(l => l.TipoCondicion).IsRequired().HasMaxLength(50);

            entity.HasData(
                new Logro { Id = Guid.Parse("11111111-1111-1111-1111-111111111111"), Nombre = "Primeros pasos", Descripcion = "Alcanza 50 XP", TipoCondicion = "xp_total", ValorCondicion = 50 },
                new Logro { Id = Guid.Parse("22222222-2222-2222-2222-222222222222"), Nombre = "En marcha", Descripcion = "Alcanza 200 XP", TipoCondicion = "xp_total", ValorCondicion = 200 },
                new Logro { Id = Guid.Parse("33333333-3333-3333-3333-333333333333"), Nombre = "Constante", Descripcion = "Completa 1 misión", TipoCondicion = "misiones_completadas", ValorCondicion = 1 },
                new Logro { Id = Guid.Parse("44444444-4444-4444-4444-444444444444"), Nombre = "Comprometido", Descripcion = "Completa 3 misiones", TipoCondicion = "misiones_completadas", ValorCondicion = 3 },
                new Logro { Id = Guid.Parse("55555555-5555-5555-5555-555555555555"), Nombre = "Maestro del XP", Descripcion = "Alcanza 1000 XP", TipoCondicion = "xp_total", ValorCondicion = 1000 }
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

        modelBuilder.Entity<UsuarioHabilidad>()
            .HasIndex(uh => new { uh.UsuarioId, uh.HabilidadId })
            .IsUnique();
    }
}