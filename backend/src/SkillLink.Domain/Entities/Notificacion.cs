namespace SkillLink.Domain.Entities;

public class Notificacion
{
    public Guid Id { get; set; }
    public Guid UsuarioId { get; set; }
    public string Tipo { get; set; } = string.Empty; // MensajePrivado | MisionCompletada | CambioRol
    public string Mensaje { get; set; } = string.Empty;
    public bool Leida { get; set; } = false;
    public DateTime Fecha { get; set; } = DateTime.UtcNow;
    public Usuario? Usuario { get; set; }
}