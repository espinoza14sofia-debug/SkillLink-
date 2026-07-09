using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SkillLink.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTablasLogroYUsuarioLogro : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Logros",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TipoCondicion = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ValorCondicion = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Logros", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UsuarioLogros",
                columns: table => new
                {
                    UsuarioId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LogroId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FechaObtenido = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UsuarioLogros", x => new { x.UsuarioId, x.LogroId });
                    table.ForeignKey(
                        name: "FK_UsuarioLogros_Logros_LogroId",
                        column: x => x.LogroId,
                        principalTable: "Logros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Logros",
                columns: new[] { "Id", "Descripcion", "Nombre", "TipoCondicion", "ValorCondicion" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), "Alcanza 50 XP", "Primeros pasos", "xp_total", 50 },
                    { new Guid("22222222-2222-2222-2222-222222222222"), "Alcanza 200 XP", "En marcha", "xp_total", 200 },
                    { new Guid("33333333-3333-3333-3333-333333333333"), "Completa 1 misión", "Constante", "misiones_completadas", 1 },
                    { new Guid("44444444-4444-4444-4444-444444444444"), "Completa 3 misiones", "Comprometido", "misiones_completadas", 3 },
                    { new Guid("55555555-5555-5555-5555-555555555555"), "Alcanza 1000 XP", "Maestro del XP", "xp_total", 1000 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_UsuarioLogros_LogroId",
                table: "UsuarioLogros",
                column: "LogroId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UsuarioLogros");

            migrationBuilder.DropTable(
                name: "Logros");
        }
    }
}
