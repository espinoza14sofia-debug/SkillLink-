using Moq;
using SkillLink.Application.DTOs;
using SkillLink.Application.Interfaces;
using SkillLink.Application.Services;
using SkillLink.Domain.Entities;
using Xunit;

namespace SkillLink.Tests;

public class AuthServiceTests
{
    private readonly Mock<IUsuarioRepository> _usuarioRepositoryMock;
    private readonly Mock<IPasswordHasher> _passwordHasherMock;
    private readonly Mock<ITokenService> _tokenServiceMock;
    private readonly Mock<ITokenRecuperacionRepository> _tokenRecuperacionRepositoryMock;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        _usuarioRepositoryMock = new Mock<IUsuarioRepository>();
        _passwordHasherMock = new Mock<IPasswordHasher>();
        _tokenServiceMock = new Mock<ITokenService>();
        _tokenRecuperacionRepositoryMock = new Mock<ITokenRecuperacionRepository>();

        _authService = new AuthService(
            _usuarioRepositoryMock.Object,
            _passwordHasherMock.Object,
            _tokenServiceMock.Object,
            _tokenRecuperacionRepositoryMock.Object
        );
    }

    // ---------- REGISTRO ----------

    [Fact]
    public async Task RegistrarAsync_ConEmailDuplicado_DeberiaRetornarError()
    {
        // Arrange
        var dto = new RegistroUsuarioDto
        {
            Nombre = "Jendry Murillo",
            Email = "mjiia@test.com",
            Password = "murillo33",
            Carrera = "Ingeniería en Sistemas"
        };

        _usuarioRepositoryMock
            .Setup(r => r.ExisteEmailAsync(dto.Email))
            .ReturnsAsync(true);

        // Act
        var resultado = await _authService.RegistrarAsync(dto);

        // Assert
        Assert.False(resultado.Exito);
        Assert.Equal("El email ya está registrado.", resultado.Error);
        Assert.Null(resultado.Usuario);
        _usuarioRepositoryMock.Verify(r => r.AgregarAsync(It.IsAny<Usuario>()), Times.Never);
    }

    [Fact]
    public async Task RegistrarAsync_ConPasswordValido_DeberiaCrearUsuarioConNivel1YXp0()
    {
        // Arrange
        var dto = new RegistroUsuarioDto
        {
            Nombre = "Sofia Vargas",
            Email = "sofia@test.com",
            Password = "MiPassword123",
            Carrera = "Ingeniería en Sistemas"
        };

        _usuarioRepositoryMock
            .Setup(r => r.ExisteEmailAsync(dto.Email))
            .ReturnsAsync(false);

        _passwordHasherMock
            .Setup(p => p.HashPassword(dto.Password))
            .Returns("hash-simulado-123");

        // Act
        var resultado = await _authService.RegistrarAsync(dto);

        // Assert
        Assert.True(resultado.Exito);
        Assert.Null(resultado.Error);
        Assert.NotNull(resultado.Usuario);
        Assert.Equal(1, resultado.Usuario!.Nivel);
        Assert.Equal(0, resultado.Usuario.Xp);
        Assert.Equal(dto.Email, resultado.Usuario.Email);

        _usuarioRepositoryMock.Verify(r => r.AgregarAsync(It.IsAny<Usuario>()), Times.Once);
        _usuarioRepositoryMock.Verify(r => r.GuardarCambiosAsync(), Times.Once);
    }

    [Fact]
    public async Task RegistrarAsync_ConCamposVacios_DeberiaRetornarError()
    {
        // Arrange
        var dto = new RegistroUsuarioDto
        {
            Nombre = "",
            Email = "sofia@test.com",
            Password = "MiPassword123"
        };

        // Act
        var resultado = await _authService.RegistrarAsync(dto);

        // Assert
        Assert.False(resultado.Exito);
        Assert.Equal("Nombre, email y contraseña son obligatorios.", resultado.Error);
    }

    // ---------- LOGIN ----------

    [Fact]
    public async Task LoginAsync_ConCredencialesCorrectas_DeberiaRetornarToken()
    {
        // Arrange
        var dto = new LoginDto { Email = "sofia@test.com", Password = "MiPassword123" };

        var usuarioExistente = new Usuario
        {
            Id = Guid.NewGuid(),
            Nombre = "Sofia Vargas",
            Email = dto.Email,
            PasswordHash = "hash-guardado",
            Nivel = 1,
            Xp = 0
        };

        _usuarioRepositoryMock
            .Setup(r => r.ObtenerPorEmailAsync(dto.Email))
            .ReturnsAsync(usuarioExistente);

        _passwordHasherMock
            .Setup(p => p.VerifyPassword(dto.Password, usuarioExistente.PasswordHash))
            .Returns(true);

        _tokenServiceMock
            .Setup(t => t.GenerateToken(usuarioExistente.Id, usuarioExistente.Email))
            .Returns("token-jwt-simulado");

        // Act
        var resultado = await _authService.LoginAsync(dto);

        // Assert
        Assert.True(resultado.Exito);
        Assert.NotNull(resultado.Resultado);
        Assert.Equal("token-jwt-simulado", resultado.Resultado!.Token);
        Assert.Equal(dto.Email, resultado.Resultado.Usuario.Email);
    }

    [Fact]
    public async Task LoginAsync_ConEmailInexistente_DeberiaRetornarError()
    {
        // Arrange
        var dto = new LoginDto { Email = "noexiste@test.com", Password = "cualquierPassword" };

        _usuarioRepositoryMock
            .Setup(r => r.ObtenerPorEmailAsync(dto.Email))
            .ReturnsAsync((Usuario?)null);

        // Act
        var resultado = await _authService.LoginAsync(dto);

        // Assert
        Assert.False(resultado.Exito);
        Assert.Equal("Credenciales inválidas.", resultado.Error);
        Assert.Null(resultado.Resultado);
    }

    [Fact]
    public async Task LoginAsync_ConPasswordIncorrecto_DeberiaRetornarError()
    {
        // Arrange
        var dto = new LoginDto { Email = "sofia@test.com", Password = "passwordIncorrecto" };

        var usuarioExistente = new Usuario
        {
            Id = Guid.NewGuid(),
            Nombre = "Sofia Vargas",
            Email = dto.Email,
            PasswordHash = "hash-guardado",
            Nivel = 1,
            Xp = 0
        };

        _usuarioRepositoryMock
            .Setup(r => r.ObtenerPorEmailAsync(dto.Email))
            .ReturnsAsync(usuarioExistente);

        _passwordHasherMock
            .Setup(p => p.VerifyPassword(dto.Password, usuarioExistente.PasswordHash))
            .Returns(false);

        // Act
        var resultado = await _authService.LoginAsync(dto);

        // Assert
        Assert.False(resultado.Exito);
        Assert.Equal("Credenciales inválidas.", resultado.Error);
        Assert.Null(resultado.Resultado);

        _tokenServiceMock.Verify(t => t.GenerateToken(It.IsAny<Guid>(), It.IsAny<string>()), Times.Never);
    }
}