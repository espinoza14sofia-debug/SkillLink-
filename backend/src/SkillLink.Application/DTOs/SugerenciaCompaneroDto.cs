namespace SkillLink.Application.DTOs;

public class SugerenciaCompaneroDto
{
    public Guid UsuarioId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public int CantidadHabilidadesEnComun { get; set; }
    public List<string> HabilidadesEnComun { get; set; } = new();
}