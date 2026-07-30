using SkillLink.Application.DTOs;
using SkillLink.Application.Interfaces;
using SkillLink.Application.Services;
using SkillLink.Domain.Entities;
using Moq;
using Xunit;

namespace SkillLink.Tests;

public class XpServiceTests
{
    private readonly Mock<IUsuarioRepository> _usuarioRepositoryMock;
    private readonly Mock<INivelService> _nivelServiceMock;
    private readonly Mock<ILogroService> _logroServiceMock;
    private readonly Mock<IMisionRepository> _misionRepositoryMock;
    private readonly Mock<INotificacionService> _notificacionServiceMock;
    private readonly XpService _xpService;

    public XpServiceTests()
    {
        _usuarioRepositoryMock = new Mock<IUsuarioRepository>();
        _nivelServiceMock = new Mock<INivelService>();
        _logroServiceMock = new Mock<ILogroService>();
        _misionRepositoryMock = new Mock<IMisionRepository>();
        _notificacionServiceMock = new Mock<INotificacionService>();

        _xpService = new XpService(
            _usuarioRepositoryMock.Object,
            _nivelServiceMock.Object,
            _logroServiceMock.Object,
            _misionRepositoryMock.Object,
            _notificacionServiceMock.Object
        );
    }

    // ---------- OtorgarXpAsync: validaciones ----------

    [Theory]
    [InlineData(0)]
    [InlineData(-10)]
    public async Task OtorgarXpAsync_ConCantidadInvalida_DeberiaLanzarArgumentException(int cantidad)
    {
        var usuarioId = Guid.NewGuid();

        var ex = await Assert.ThrowsAsync<ArgumentException>(
            () => _xpService.OtorgarXpAsync(usuarioId, cantidad));

        Assert.Equal("La cantidad de XP debe ser mayor a cero.", ex.Message);

        // No debe ni siquiera consultar al usuario si la validación falla antes
        _usuarioRepositoryMock.Verify(
            r => r.ObtenerPorIdAsync(It.IsAny<Guid>()),
            Times.Never);
    }

    [Fact]
    public async Task OtorgarXpAsync_ConUsuarioInexistente_DeberiaLanzarInvalidOperationException()
    {
        var usuarioId = Guid.NewGuid();

        _usuarioRepositoryMock
            .Setup(r => r.ObtenerPorIdAsync(usuarioId))
            .ReturnsAsync((Usuario?)null);

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _xpService.OtorgarXpAsync(usuarioId, 10));

        Assert.Equal("Usuario no encontrado.", ex.Message);

        _usuarioRepositoryMock.Verify(r => r.GuardarCambiosAsync(), Times.Never);
    }

    // ---------- OtorgarXpAsync: actualización de datos correctos ----------

    [Fact]
    public async Task OtorgarXpAsync_ConDatosValidos_DeberiaSumarXpYActualizarNivel()
    {
        var usuarioId = Guid.NewGuid();
        var usuario = new Usuario { Id = usuarioId, Xp = 10, Nivel = 1 };

        _usuarioRepositoryMock
            .Setup(r => r.ObtenerPorIdAsync(usuarioId))
            .ReturnsAsync(usuario);

        // El servicio suma la cantidad ANTES de calcular el nivel: 10 + 5 = 15
        _nivelServiceMock
            .Setup(n => n.CalcularNivelAsync(15))
            .ReturnsAsync(new NivelInfoDto { Nivel = 1 });

        _misionRepositoryMock
            .Setup(m => m.ContarCompletadasPorUsuarioAsync(usuarioId))
            .ReturnsAsync(0);

        _logroServiceMock
            .Setup(l => l.EvaluarYOtorgarAsync(usuarioId, 15, 0))
            .ReturnsAsync(new List<LogroDto>());

        var resultado = await _xpService.OtorgarXpAsync(usuarioId, 5);

        // Verifica que el usuario quedó con el XP correcto (efecto secundario real sobre la entidad)
        Assert.Equal(15, usuario.Xp);
        Assert.Equal(1, usuario.Nivel);
        Assert.False(resultado.SubioDeNivel);
        Assert.Empty(resultado.NuevosLogros);

        _usuarioRepositoryMock.Verify(r => r.GuardarCambiosAsync(), Times.Once);
        _nivelServiceMock.Verify(n => n.CalcularNivelAsync(15), Times.Once);
    }

    [Fact]
    public async Task OtorgarXpAsync_SubiendoDeNivel_DeberiaActualizarNivelYNotificar()
    {
        var usuarioId = Guid.NewGuid();
        var usuario = new Usuario { Id = usuarioId, Xp = 95, Nivel = 1 };

        _usuarioRepositoryMock
            .Setup(r => r.ObtenerPorIdAsync(usuarioId))
            .ReturnsAsync(usuario);

        // 95 + 10 = 105 -> nivel calculado sube a 2
        _nivelServiceMock
            .Setup(n => n.CalcularNivelAsync(105))
            .ReturnsAsync(new NivelInfoDto { Nivel = 2 });

        _misionRepositoryMock
            .Setup(m => m.ContarCompletadasPorUsuarioAsync(usuarioId))
            .ReturnsAsync(0);

        _logroServiceMock
            .Setup(l => l.EvaluarYOtorgarAsync(usuarioId, 105, 0))
            .ReturnsAsync(new List<LogroDto>());

        var resultado = await _xpService.OtorgarXpAsync(usuarioId, 10);

        Assert.Equal(105, usuario.Xp);
        Assert.Equal(2, usuario.Nivel);       // el campo Nivel del usuario debe quedar actualizado
        Assert.True(resultado.SubioDeNivel);  // el DTO calcula esto comparando nivelAnterior vs nuevo

        _notificacionServiceMock.Verify(
            n => n.CrearAsync(usuarioId, "subida_nivel", It.Is<string>(s => s.Contains("2"))),
            Times.Once);
    }

    [Fact]
    public async Task OtorgarXpAsync_ConNuevosLogros_DeberiaAsignarlosAlDtoYNotificarCadaUno()
    {
        var usuarioId = Guid.NewGuid();
        var usuario = new Usuario { Id = usuarioId, Xp = 10, Nivel = 1 };

        var logros = new List<LogroDto>
        {
            new() { Id = Guid.NewGuid(), Nombre = "Primer Mensaje", Desbloqueado = true },
            new() { Id = Guid.NewGuid(), Nombre = "Conector Novato", Desbloqueado = true }
        };

        _usuarioRepositoryMock
            .Setup(r => r.ObtenerPorIdAsync(usuarioId))
            .ReturnsAsync(usuario);

        _nivelServiceMock
            .Setup(n => n.CalcularNivelAsync(15))
            .ReturnsAsync(new NivelInfoDto { Nivel = 1 });

        _misionRepositoryMock
            .Setup(m => m.ContarCompletadasPorUsuarioAsync(usuarioId))
            .ReturnsAsync(1);

        _logroServiceMock
            .Setup(l => l.EvaluarYOtorgarAsync(usuarioId, 15, 1))
            .ReturnsAsync(logros);

        var resultado = await _xpService.OtorgarXpAsync(usuarioId, 5);

        // El DTO de resultado debe reflejar exactamente los logros devueltos por el servicio
        Assert.Equal(2, resultado.NuevosLogros.Count);
        Assert.Contains(resultado.NuevosLogros, l => l.Nombre == "Primer Mensaje");
        Assert.Contains(resultado.NuevosLogros, l => l.Nombre == "Conector Novato");

        _notificacionServiceMock.Verify(
            n => n.CrearAsync(usuarioId, "logro_desbloqueado", It.Is<string>(s => s.Contains("Primer Mensaje"))),
            Times.Once);

        _notificacionServiceMock.Verify(
            n => n.CrearAsync(usuarioId, "logro_desbloqueado", It.Is<string>(s => s.Contains("Conector Novato"))),
            Times.Once);
    }

    // ---------- OtorgarXpPorMensajeAsync ----------

    [Fact]
    public async Task OtorgarXpPorMensajeAsync_ConUsuarioInexistente_DeberiaLanzarInvalidOperationException()
    {
        var usuarioId = Guid.NewGuid();

        _usuarioRepositoryMock
            .Setup(r => r.ObtenerPorIdAsync(usuarioId))
            .ReturnsAsync((Usuario?)null);

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _xpService.OtorgarXpPorMensajeAsync(usuarioId));
    }

    [Fact]
    public async Task OtorgarXpPorMensajeAsync_DentroDelCooldown_NoDeberiaOtorgarXpYRetornarNull()
    {
        var usuarioId = Guid.NewGuid();
        var usuario = new Usuario
        {
            Id = usuarioId,
            Xp = 10,
            Nivel = 1,
            UltimoXpMensajeFecha = DateTime.UtcNow.AddMinutes(-1) // cooldown es de 5 min
        };

        _usuarioRepositoryMock
            .Setup(r => r.ObtenerPorIdAsync(usuarioId))
            .ReturnsAsync(usuario);

        var resultado = await _xpService.OtorgarXpPorMensajeAsync(usuarioId);

        Assert.Null(resultado);
        Assert.Equal(10, usuario.Xp); // el XP NO debe cambiar durante el cooldown

        _usuarioRepositoryMock.Verify(r => r.GuardarCambiosAsync(), Times.Never);
        _nivelServiceMock.Verify(n => n.CalcularNivelAsync(It.IsAny<int>()), Times.Never);
    }

    [Fact]
    public async Task OtorgarXpPorMensajeAsync_FueraDelCooldown_DeberiaOtorgar5XpYActualizarFecha()
    {
        var usuarioId = Guid.NewGuid();
        var usuario = new Usuario
        {
            Id = usuarioId,
            Xp = 10,
            Nivel = 1,
            UltimoXpMensajeFecha = null // nunca ha recibido XP por mensaje
        };

        _usuarioRepositoryMock
            .Setup(r => r.ObtenerPorIdAsync(usuarioId))
            .ReturnsAsync(usuario);

        // 10 (inicial) + 5 (XpPorMensaje) = 15
        _nivelServiceMock
            .Setup(n => n.CalcularNivelAsync(15))
            .ReturnsAsync(new NivelInfoDto { Nivel = 1 });

        _misionRepositoryMock
            .Setup(m => m.ContarCompletadasPorUsuarioAsync(usuarioId))
            .ReturnsAsync(0);

        _logroServiceMock
            .Setup(l => l.EvaluarYOtorgarAsync(usuarioId, 15, 0))
            .ReturnsAsync(new List<LogroDto>());

        var resultado = await _xpService.OtorgarXpPorMensajeAsync(usuarioId);

        Assert.NotNull(resultado);
        Assert.Equal(15, usuario.Xp);                  // exactamente 5 XP otorgados, ni más ni menos
        Assert.NotNull(usuario.UltimoXpMensajeFecha);  // se marcó la fecha de cooldown

        // GuardarCambiosAsync se llama 2 veces: una al fijar la fecha de cooldown,
        // otra dentro de OtorgarXpAsync al sumar el XP
        _usuarioRepositoryMock.Verify(r => r.GuardarCambiosAsync(), Times.Exactly(2));
    }

    [Fact]
    public async Task OtorgarXpPorMensajeAsync_JustoDespuesDelCooldown_DeberiaOtorgarXp()
    {
        var usuarioId = Guid.NewGuid();
        var usuario = new Usuario
        {
            Id = usuarioId,
            Xp = 0,
            Nivel = 1,
            UltimoXpMensajeFecha = DateTime.UtcNow.AddMinutes(-6) // ya pasó el cooldown de 5 min
        };

        _usuarioRepositoryMock
            .Setup(r => r.ObtenerPorIdAsync(usuarioId))
            .ReturnsAsync(usuario);

        _nivelServiceMock
            .Setup(n => n.CalcularNivelAsync(5))
            .ReturnsAsync(new NivelInfoDto { Nivel = 1 });

        _misionRepositoryMock
            .Setup(m => m.ContarCompletadasPorUsuarioAsync(usuarioId))
            .ReturnsAsync(0);

        _logroServiceMock
            .Setup(l => l.EvaluarYOtorgarAsync(usuarioId, 5, 0))
            .ReturnsAsync(new List<LogroDto>());

        var resultado = await _xpService.OtorgarXpPorMensajeAsync(usuarioId);

        Assert.NotNull(resultado);
        Assert.Equal(5, usuario.Xp);
    }
}