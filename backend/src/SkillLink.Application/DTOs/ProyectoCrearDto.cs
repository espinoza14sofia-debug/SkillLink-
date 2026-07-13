namespace SkillLink.Application.DTOs
{
    public class ProyectoCrearDto
    {
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public Guid EquipoId { get; set; }
    }
}