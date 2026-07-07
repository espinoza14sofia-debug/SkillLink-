using SkillLink.Application.DTOs;
using SkillLink.Application.Interfaces;
using SkillLink.Domain.Entities;

namespace SkillLink.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;

    public AuthService(IUsuarioRepository usuarioRepository, IPasswordHasher passwordHasher, ITokenService tokenService)
    {
        _usuarioRepository = usuarioRepository;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
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
}