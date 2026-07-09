namespace SkillLink.Application.DTOs;

public class NivelInfoDto
{
    public int Nivel { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public int Xp { get; set; }
    public int XpProximoNivel { get; set; }
    public int XpRestante { get; set; }
    public double Progreso { get; set; } // 0 a 100
}