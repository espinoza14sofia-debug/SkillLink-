namespace SkillLink.Domain.Entities
{
    public class UsuarioHabilidad
    {
        public Guid UsuarioId { get; set; }
        public Guid HabilidadId { get; set; }
        public string Nivel { get; set; } = "Básico";

        public Usuario? Usuario { get; set; }
        public Habilidad? Habilidad { get; set; }
    }
}