namespace SkillLink.Domain.Entities
{
    public class PushSubscription
    {
        public Guid Id { get; set; }
        public Guid UsuarioId { get; set; }
        public string Endpoint { get; set; } = string.Empty;
        public string P256dh { get; set; } = string.Empty;
        public string Auth { get; set; } = string.Empty;
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        public Usuario? Usuario { get; set; }
    }
}