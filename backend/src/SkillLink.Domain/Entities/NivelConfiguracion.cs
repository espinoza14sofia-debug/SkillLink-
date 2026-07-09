namespace SkillLink.Domain.Entities;

public class NivelConfiguracion
{
    public int Id { get; set; }
    public int Nivel { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public int XpMinimo { get; set; }
}