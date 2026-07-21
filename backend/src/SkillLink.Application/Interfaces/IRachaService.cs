namespace SkillLink.Application.Interfaces;

public interface IRachaService
{
    // Se llama cada vez que el usuario hace algo relevante en la app.
    // Actualiza su racha de días consecutivos y devuelve el valor actual.
    Task<int> RegistrarActividadAsync(Guid usuarioId);
}