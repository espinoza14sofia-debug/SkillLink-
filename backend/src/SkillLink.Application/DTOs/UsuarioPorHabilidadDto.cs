namespace SkillLink.Application.DTOs;

public class UsuarioPorHabilidadDto
{
    public Guid UsuarioId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Foto { get; set; }
    public string? Carrera { get; set; }
    public string NivelHabilidad { get; set; } = string.Empty; // Básico / Intermedio / Avanzado
    public string HabilidadCoincidente { get; set; } = string.Empty; // nombre exacto de la habilidad que hizo match
}
