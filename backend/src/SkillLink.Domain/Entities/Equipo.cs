using System;
using System.Collections.Generic;
using System.Text;

namespace SkillLink.Domain.Entities
{
    public class Equipo
    {
        public Guid Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        public ICollection<MiembroEquipo> Miembros { get; set; } = new List<MiembroEquipo>();

    }
}
