using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SkillLink.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class NombreDeLaMigracion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "EsUrgente",
                table: "Misiones",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Etiquetas",
                table: "Misiones",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaLimite",
                table: "Misiones",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Progreso",
                table: "Misiones",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "ProyectoId",
                table: "Misiones",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Misiones_ProyectoId",
                table: "Misiones",
                column: "ProyectoId");

            migrationBuilder.AddForeignKey(
                name: "FK_Misiones_Proyectos_ProyectoId",
                table: "Misiones",
                column: "ProyectoId",
                principalTable: "Proyectos",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Misiones_Proyectos_ProyectoId",
                table: "Misiones");

            migrationBuilder.DropIndex(
                name: "IX_Misiones_ProyectoId",
                table: "Misiones");

            migrationBuilder.DropColumn(
                name: "EsUrgente",
                table: "Misiones");

            migrationBuilder.DropColumn(
                name: "Etiquetas",
                table: "Misiones");

            migrationBuilder.DropColumn(
                name: "FechaLimite",
                table: "Misiones");

            migrationBuilder.DropColumn(
                name: "Progreso",
                table: "Misiones");

            migrationBuilder.DropColumn(
                name: "ProyectoId",
                table: "Misiones");
        }
    }
}
