using System;

namespace SkillLink.Domain.Entities
{
    public class Mensaje
    {
        public Guid Id { get; set; }
        public Guid EmisorId { get; set; }
        public Guid EquipoId { get; set; }
        public string Contenido { get; set; } = string.Empty;
        public DateTime Fecha { get; set; } = DateTime.UtcNow;

        public Usuario? Emisor { get; set; }
        public Equipo? Equipo { get; set; }
    }
}