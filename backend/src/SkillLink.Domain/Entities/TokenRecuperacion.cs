namespace SkillLink.Domain.Entities;

public class TokenRecuperacion
{
    public Guid Id { get; set; }
    public Guid UsuarioId { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime FechaExpiracion { get; set; }
    public bool Usado { get; set; } = false;

    public Usuario? Usuario { get; set; }
}