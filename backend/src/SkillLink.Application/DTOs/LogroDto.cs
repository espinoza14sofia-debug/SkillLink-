namespace SkillLink.Application.DTOs;

public class LogroDto
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public bool Desbloqueado { get; set; }
    public DateTime? FechaObtenido { get; set; }
}