using System;
using System.Collections.Generic;
using System.Text;

namespace SkillLink.Domain.Entities;

public enum EstadoProyecto
{
    EnProgreso = 0,
    Completado = 1
}

public class Proyecto
    {
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public Guid EquipoId { get; set; }
    public Equipo Equipo { get; set; } = null!;
    public EstadoProyecto Estado { get; set; } = EstadoProyecto.EnProgreso;
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

}

