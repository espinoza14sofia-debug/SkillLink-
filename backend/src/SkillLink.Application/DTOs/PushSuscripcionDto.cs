namespace SkillLink.Application.DTOs;

public class PushSuscripcionKeysDto
{
    public string P256dh { get; set; } = string.Empty;
    public string Auth { get; set; } = string.Empty;
}

public class PushSuscripcionDto
{
    public string Endpoint { get; set; } = string.Empty;
    public PushSuscripcionKeysDto Keys { get; set; } = new();
}