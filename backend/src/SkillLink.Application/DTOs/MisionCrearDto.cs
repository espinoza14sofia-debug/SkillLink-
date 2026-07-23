using System;

namespace SkillLink.Application.DTOs
{
    public class MisionCrearDto
    {
        public string Titulo { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public int XpValor { get; set; }
        public Guid? UsuarioAsignadoId { get; set; }
        public Guid? ProyectoId { get; set; }
        public DateTime? FechaLimite { get; set; }
        public string? Etiquetas { get; set; }
        public bool EsUrgente { get; set; }
    }
}