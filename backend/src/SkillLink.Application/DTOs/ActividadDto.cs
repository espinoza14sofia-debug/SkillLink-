namespace SkillLink.Application.DTOs;

public class ActividadDto
{
    public Guid Id { get; set; }
    public string Texto { get; set; } = string.Empty;
    public int? Xp { get; set; }
    public string Tiempo { get; set; } = string.Empty;  
}