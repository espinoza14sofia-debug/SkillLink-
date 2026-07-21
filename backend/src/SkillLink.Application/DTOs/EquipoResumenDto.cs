namespace SkillLink.Application.DTOs;

public class EquipoResumenDto
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Rol { get; set; } = string.Empty;
    public int CantidadMiembros { get; set; }
    public DateTime FechaCreacion { get; set; }
}