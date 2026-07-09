namespace SkillLink.Application.DTOs;

public class MisionRespuestaDto
{
    public Guid Id { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string Estado { get; set; } = string.Empty;
    public int XpValor { get; set; }
    public Guid? UsuarioAsignadoId { get; set; }
    public DateTime FechaCreacion { get; set; }
}