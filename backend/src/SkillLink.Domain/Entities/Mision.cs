namespace SkillLink.Domain.Entities;
public class Mision
{
    public Guid Id { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string Estado { get; set; } = "pendiente"; // pendiente | completada
    public int XpValor { get; set; }
    public Guid? UsuarioAsignadoId { get; set; }
    public Guid? EquipoId { get; set; }
    public DateTime FechaCreacion { get; set; }
    public Equipo? Equipo { get; set; }
}