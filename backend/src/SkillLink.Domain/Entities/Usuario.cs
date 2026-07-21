namespace SkillLink.Domain.Entities;

public class Usuario
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? Carrera { get; set; }
    public string? Foto { get; set; }
    public int Nivel { get; set; } = 1;
    public int Xp { get; set; } = 0;
    public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;
    public DateTime? UltimoXpMensajeFecha { get; set; }
    public DateTime? UltimaActividad { get; set; }
    public int RachaActual { get; set; } = 0;
}