namespace SkillLink.Application.DTOs;

public class MisionCrearDto
{
    public string Titulo { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public int XpValor { get; set; } = 50;
}
