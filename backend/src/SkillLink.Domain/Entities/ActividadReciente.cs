namespace SkillLink.Domain.Entities;

public class ActividadReciente
{
    public Guid Id { get; set; }
    public Guid UsuarioId { get; set; }
    public string Texto { get; set; } = string.Empty;
    public int? Xp { get; set; }
    public DateTime Fecha { get; set; }
}