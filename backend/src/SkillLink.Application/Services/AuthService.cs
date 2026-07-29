using Microsoft.AspNetCore.Identity;
using SkillLink.Application.DTOs;
using SkillLink.Application.Interfaces;
using SkillLink.Domain.Entities;
using System;
using System.Threading.Tasks;

namespace SkillLink.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly ITokenRecuperacionRepository _tokenRepository;
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly IPasswordHasher<Usuario> _passwordHasher;
        private readonly ITokenService _tokenService;

        public AuthService(
            ITokenRecuperacionRepository tokenRepository,
            IUsuarioRepository usuarioRepository,
            IPasswordHasher<Usuario> passwordHasher,
            ITokenService tokenService)
        {
            _tokenRepository = tokenRepository;
            _usuarioRepository = usuarioRepository;
            _passwordHasher = passwordHasher;
            _tokenService = tokenService;
        }

        public async Task<(bool Exito, string? Error, UsuarioRespuestaDto? Usuario)> RegistrarAsync(UsuarioRegistroDto dto)
        {
            var existe = await _usuarioRepository.ObtenerPorEmailAsync(dto.Email);
            if (existe != null)
            {
                return (false, "El correo ya está registrado.", null);
            }

            var nuevoUsuario = new Usuario
            {
                Nombre = dto.Nombre,
                Email = dto.Email,
                Carrera = dto.Carrera,
                FechaRegistro = DateTime.UtcNow
            };

            nuevoUsuario.PasswordHash = _passwordHasher.HashPassword(nuevoUsuario, dto.Password);

            await _usuarioRepository.AgregarAsync(nuevoUsuario);
            await _usuarioRepository.GuardarCambiosAsync();

            var respuesta = new UsuarioRespuestaDto
            {
                Id = nuevoUsuario.Id,
                Nombre = nuevoUsuario.Nombre,
                Email = nuevoUsuario.Email,
                Carrera = nuevoUsuario.Carrera
            };

            return (true, null, respuesta);
        }

        public async Task<(bool Exito, string? Error, LoginRespuestaDto? Resultado)> LoginAsync(LoginDto dto)
        {
            var usuario = await _usuarioRepository.ObtenerPorEmailAsync(dto.Email);
            if (usuario == null)
            {
                return (false, "Credenciales inválidas.", null);
            }

            var verificacion = _passwordHasher.VerifyHashedPassword(usuario, usuario.PasswordHash, dto.Password);
            if (verificacion == PasswordVerificationResult.Failed)
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
                    Carrera = usuario.Carrera
                }
            };

            return (true, null, respuesta);
        }

        public async Task<(bool Exito, string? Error)> SolicitarRecuperacionAsync(SolicitarRecuperacionDto dto)
        {
            var usuario = await _usuarioRepository.ObtenerPorEmailAsync(dto.Email);

            if (usuario == null)
            {
                return (true, null);
            }

            var tokenString = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");

            var tokenRecuperacion = new TokenRecuperacion
            {
                Token = tokenString,
                UsuarioId = usuario.Id,
                FechaExpiracion = DateTime.UtcNow.AddHours(2)
            };

            await _tokenRepository.CrearAsync(tokenRecuperacion);
            await _tokenRepository.GuardarCambiosAsync();

            return (true, null);
        }

        public async Task<(bool Exito, string? Error)> RestablecerPasswordAsync(RestablecerPasswordDto dto)
        {
            var tokenRecuperacion = await _tokenRepository.ObtenerPorTokenAsync(dto.Token);

            if (tokenRecuperacion == null)
            {
                return (false, "El token de recuperación es inválido.");
            }

            if (tokenRecuperacion.FechaExpiracion < DateTime.UtcNow)
            {
                return (false, "El token de recuperación ha expirado.");
            }

            var usuario = await _usuarioRepository.ObtenerPorIdAsync(tokenRecuperacion.UsuarioId);
            if (usuario == null)
            {
                return (false, "El usuario asociado al token no existe.");
            }

            usuario.PasswordHash = _passwordHasher.HashPassword(usuario, dto.NuevoPassword);

            await _usuarioRepository.GuardarCambiosAsync();

            return (true, null);
        }
    }
}