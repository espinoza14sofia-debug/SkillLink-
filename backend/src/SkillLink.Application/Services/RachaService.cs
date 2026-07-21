using SkillLink.Application.Interfaces;

namespace SkillLink.Application.Services;

public class RachaService : IRachaService
{
    private readonly IUsuarioRepository _usuarioRepository;

    public RachaService(IUsuarioRepository usuarioRepository)
    {
        _usuarioRepository = usuarioRepository;
    }

    public async Task<int> RegistrarActividadAsync(Guid usuarioId)
    {
        var usuario = await _usuarioRepository.ObtenerPorIdAsync(usuarioId);
        if (usuario == null) return 0;

        var hoy = DateTime.UtcNow.Date;

        if (usuario.UltimaActividad == null)
        {
            // Primera vez que registramos actividad para este usuario.
            usuario.RachaActual = 1;
        }
        else
        {
            var ultima = usuario.UltimaActividad.Value.Date;
            var diasDeDiferencia = (hoy - ultima).Days;

            if (diasDeDiferencia == 0)
            {
                // Ya se registró actividad hoy, no cambia nada.
            }
            else if (diasDeDiferencia == 1)
            {
                // Vino un día después del último registro: la racha sigue.
                usuario.RachaActual += 1;
            }
            else
            {
                // Pasó más de un día sin actividad: se corta la racha.
                usuario.RachaActual = 1;
            }
        }

        usuario.UltimaActividad = DateTime.UtcNow;
        await _usuarioRepository.GuardarCambiosAsync();

        return usuario.RachaActual;
    }
}