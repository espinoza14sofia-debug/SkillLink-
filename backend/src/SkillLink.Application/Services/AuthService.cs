using SkillLink.Application.DTOs;
using SkillLink.Application.Interfaces;
using SkillLink.Domain.Entities;

namespace SkillLink.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;
    private readonly ITokenRecuperacionRepository _tokenRecuperacionRepository;

    public AuthService(
        IUsuarioRepository usuarioRepository,
        IPasswordHasher passwordHasher,
        ITokenService tokenService,
        ITokenRecuperacionRepository tokenRecuperacionRepository)
    {
        _usuarioRepository = usuarioRepository;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _tokenRecuperacionRepository = tokenRecuperacionRepository;
    }

    public async Task<(bool Exito, string? Error, UsuarioRespuestaDto? Usuario)> RegistrarAsync(RegistroUsuarioDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Nombre) || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
        {
            return (false, "Nombre, email y contraseña son obligatorios.", null);
        }

        var existe = await _usuarioRepository.ExisteEmailAsync(dto.Email);
        if (existe)
        {
            return (false, "El email ya está registrado.", null);
        }

        var usuario = new Usuario
        {
            Id = Guid.NewGuid(),
            Nombre = dto.Nombre,
            Email = dto.Email,
            PasswordHash = _passwordHasher.HashPassword(dto.Password),
            Carrera = dto.Carrera,
            Nivel = 1,
            Xp = 0,
            FechaRegistro = DateTime.UtcNow
        };

        await _usuarioRepository.AgregarAsync(usuario);
        await _usuarioRepository.GuardarCambiosAsync();

        var respuesta = new UsuarioRespuestaDto
        {
            Id = usuario.Id,
            Nombre = usuario.Nombre,
            Email = usuario.Email,
            Carrera = usuario.Carrera,
            Nivel = usuario.Nivel,
            Xp = usuario.Xp
        };

        return (true, null, respuesta);
    }

    public async Task<(bool Exito, string? Error, LoginRespuestaDto? Resultado)> LoginAsync(LoginDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
        {
            return (false, "Email y contraseña son obligatorios.", null);
        }

        var usuario = await _usuarioRepository.ObtenerPorEmailAsync(dto.Email);
        if (usuario == null)
        {
            return (false, "Credenciales inválidas.", null);
        }

        var passwordValido = _passwordHasher.VerifyPassword(dto.Password, usuario.PasswordHash);
        if (!passwordValido)
        {
            return (false, "Credenciales inválidas.", null);
        }

        var token = _tokenService.GenerateToken(usuario.Id, usuario.Email);

        var respuesta = new LoginRespuestaDto
        {
            Token = token,
            Usuario = new UsuarioRespuestaDto
            {
                Id = usuario.Id,
                Nombre = usuario.Nombre,
                Email = usuario.Email,
                Carrera = usuario.Carrera,
                Nivel = usuario.Nivel,
                Xp = usuario.Xp
            }
        };

        return (true, null, respuesta);
    }

    public async Task<(bool Exito, string? Error)> SolicitarRecuperacionAsync(SolicitarRecuperacionDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email))
        {
            return (false, "El email es obligatorio.");
        }

        var usuario = await _usuarioRepository.ObtenerPorEmailAsync(dto.Email);
        if (usuario == null)
        {
            // No revelamos si el email existe o no, por seguridad
            return (true, null);
        }

        var token = new TokenRecuperacion
        {
            Id = Guid.NewGuid(),
            UsuarioId = usuario.Id,
            Token = Guid.NewGuid().ToString("N"),
            FechaExpiracion = DateTime.UtcNow.AddMinutes(15),
            Usado = false
        };

        await _tokenRecuperacionRepository.CrearAsync(token);

        // Simulación de envío de email (se ve en la consola/log del servidor)
        Console.WriteLine($"[SIMULACIÓN EMAIL] Para: {usuario.Email}");
        Console.WriteLine($"[SIMULACIÓN EMAIL] Token de recuperación: {token.Token}");
        Console.WriteLine($"[SIMULACIÓN EMAIL] Expira: {token.FechaExpiracion:u}");

        return (true, null);
    }

    public async Task<(bool Exito, string? Error)> RestablecerPasswordAsync(RestablecerPasswordDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Token) || string.IsNullOrWhiteSpace(dto.NuevaPassword))
        {
            return (false, "Token y nueva contraseña son obligatorios.");
        }

        var tokenEntity = await _tokenRecuperacionRepository.ObtenerPorTokenAsync(dto.Token);

        if (tokenEntity == null || tokenEntity.Usado || tokenEntity.FechaExpiracion < DateTime.UtcNow)
        {
            return (false, "Token inválido o expirado.");
        }

        var usuario = await _usuarioRepository.ObtenerPorIdAsync(tokenEntity.UsuarioId);
        if (usuario == null)
        {
            return (false, "Usuario no encontrado.");
        }

        usuario.PasswordHash = _passwordHasher.HashPassword(dto.NuevaPassword);
        tokenEntity.Usado = true;

        await _usuarioRepository.GuardarCambiosAsync();
        await _tokenRecuperacionRepository.GuardarCambiosAsync();

        return (true, null);
    }
}