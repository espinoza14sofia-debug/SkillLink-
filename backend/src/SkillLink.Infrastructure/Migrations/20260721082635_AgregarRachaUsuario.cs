using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SkillLink.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AgregarRachaUsuario : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "RachaActual",
                table: "Usuarios",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "UltimaActividad",
                table: "Usuarios",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Leido",
                table: "MensajesPrivados",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RachaActual",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "UltimaActividad",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "Leido",
                table: "MensajesPrivados");
        }
    }
}
