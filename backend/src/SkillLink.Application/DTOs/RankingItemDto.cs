namespace SkillLink.Application.DTOs;

public class RankingItemDto
{
    public Guid UsuarioId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public int Xp { get; set; }
    public int Nivel { get; set; }
    public int Posicion { get; set; }
    public string? Carrera { get; set; }    
}