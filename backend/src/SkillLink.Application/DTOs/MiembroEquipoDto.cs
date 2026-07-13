using System;
using System.Collections.Generic;
using System.Text;

namespace SkillLink.Application.DTOs
{
    public class MiembroEquipoDto
    {
        public Guid UsuarioId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Rol { get; set; } = string.Empty;
    }
}
