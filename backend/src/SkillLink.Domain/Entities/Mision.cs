namespace SkillLink.Domain.Entities;
public class Mision
{
    public Guid Id { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string Estado { get; set; } = "pendiente";   
    public int XpValor { get; set; }
    public Guid? UsuarioAsignadoId { get; set; }
    public Guid? EquipoId { get; set; }
    public DateTime FechaCreacion { get; set; }
 
    public Equipo? Equipo { get; set; }
 

    public Guid? ProyectoId { get; set; }
    public Proyecto? Proyecto { get; set; }

    public DateTime? FechaLimite { get; set; }
    public string? Etiquetas { get; set; } 
    public int Progreso { get; set; } = 0;     public bool EsUrgente { get; set; } = false; // marcado manualmente por el creador
 
}