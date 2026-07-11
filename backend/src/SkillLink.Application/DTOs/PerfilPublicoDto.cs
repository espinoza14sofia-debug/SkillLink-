namespace SkillLink.Application.DTOs
{
    public class PerfilPublicoDto
    {
        public Guid Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Foto { get; set; }
        public int Nivel { get; set; }
        public int Xp { get; set; }
    }
}