using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SkillLink.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ArreglarRelacionUsuarioHabilidadYNotificacion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UsuarioHabilidades_Usuarios_UsuarioId1",
                table: "UsuarioHabilidades");

            migrationBuilder.DropIndex(
                name: "IX_UsuarioHabilidades_UsuarioId1",
                table: "UsuarioHabilidades");

            migrationBuilder.DropIndex(
                name: "IX_Notificaciones_UsuarioId",
                table: "Notificaciones");

            migrationBuilder.DropColumn(
                name: "UsuarioId1",
                table: "UsuarioHabilidades");

            migrationBuilder.AlterColumn<string>(
                name: "Tipo",
                table: "Notificaciones",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Mensaje",
                table: "Notificaciones",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.CreateIndex(
                name: "IX_Notificaciones_UsuarioId_Leida",
                table: "Notificaciones",
                columns: new[] { "UsuarioId", "Leida" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Notificaciones_UsuarioId_Leida",
                table: "Notificaciones");

            migrationBuilder.AddColumn<Guid>(
                name: "UsuarioId1",
                table: "UsuarioHabilidades",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Tipo",
                table: "Notificaciones",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "Mensaje",
                table: "Notificaciones",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500);

            migrationBuilder.CreateIndex(
                name: "IX_UsuarioHabilidades_UsuarioId1",
                table: "UsuarioHabilidades",
                column: "UsuarioId1");

            migrationBuilder.CreateIndex(
                name: "IX_Notificaciones_UsuarioId",
                table: "Notificaciones",
                column: "UsuarioId");

            migrationBuilder.AddForeignKey(
                name: "FK_UsuarioHabilidades_Usuarios_UsuarioId1",
                table: "UsuarioHabilidades",
                column: "UsuarioId1",
                principalTable: "Usuarios",
                principalColumn: "Id");
        }
    }
}
