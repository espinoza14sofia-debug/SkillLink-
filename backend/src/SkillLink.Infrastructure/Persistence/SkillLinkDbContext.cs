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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasKey(u => u.Id);

            entity.Property(u => u.Nombre)
                .IsRequired()
                .HasMaxLength(150);

            entity.Property(u => u.Email)
                .IsRequired()
                .HasMaxLength(200);

            entity.HasIndex(u => u.Email)
                .IsUnique();

            entity.Property(u => u.PasswordHash)
                .IsRequired();

            entity.Property(u => u.Carrera)
                .HasMaxLength(150);

            entity.Property(u => u.FechaRegistro)
                .IsRequired();
        });
    }
}