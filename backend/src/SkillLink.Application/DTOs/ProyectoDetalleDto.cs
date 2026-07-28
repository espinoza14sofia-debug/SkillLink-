using System;
using System.Collections.Generic;
using System.Text;

namespace SkillLink.Application.DTOs
{
    public class ProyectoDetalleDto
    {
        public Guid Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public string Estado { get; set; } = string.Empty;
        public double PorcentajeAvance { get; set; }
        public DateTime FechaCreacion { get; set; }
        public Guid EquipoId { get; set; }
    }
}