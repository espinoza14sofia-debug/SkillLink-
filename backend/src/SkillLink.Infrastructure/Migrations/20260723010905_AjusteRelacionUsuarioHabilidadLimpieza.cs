using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SkillLink.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AjusteRelacionUsuarioHabilidadLimpieza : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_UsuarioHabilidades",
                table: "UsuarioHabilidades");

            migrationBuilder.DropIndex(
                name: "IX_UsuarioHabilidades_UsuarioId_HabilidadId",
                table: "UsuarioHabilidades");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "UsuarioHabilidades");

            migrationBuilder.AddColumn<string>(
                name: "Descripcion",
                table: "Usuarios",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Github",
                table: "Usuarios",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Linkedin",
                table: "Usuarios",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Semestre",
                table: "Usuarios",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UsuarioId1",
                table: "UsuarioHabilidades",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_UsuarioHabilidades",
                table: "UsuarioHabilidades",
                columns: new[] { "UsuarioId", "HabilidadId" });

            migrationBuilder.CreateIndex(
                name: "IX_UsuarioHabilidades_UsuarioId1",
                table: "UsuarioHabilidades",
                column: "UsuarioId1");

            migrationBuilder.AddForeignKey(
                name: "FK_UsuarioHabilidades_Usuarios_UsuarioId1",
                table: "UsuarioHabilidades",
                column: "UsuarioId1",
                principalTable: "Usuarios",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UsuarioHabilidades_Usuarios_UsuarioId1",
                table: "UsuarioHabilidades");

            migrationBuilder.DropPrimaryKey(
                name: "PK_UsuarioHabilidades",
                table: "UsuarioHabilidades");

            migrationBuilder.DropIndex(
                name: "IX_UsuarioHabilidades_UsuarioId1",
                table: "UsuarioHabilidades");

            migrationBuilder.DropColumn(
                name: "Descripcion",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "Github",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "Linkedin",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "Semestre",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "UsuarioId1",
                table: "UsuarioHabilidades");

            migrationBuilder.AddColumn<Guid>(
                name: "Id",
                table: "UsuarioHabilidades",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddPrimaryKey(
                name: "PK_UsuarioHabilidades",
                table: "UsuarioHabilidades",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_UsuarioHabilidades_UsuarioId_HabilidadId",
                table: "UsuarioHabilidades",
                columns: new[] { "UsuarioId", "HabilidadId" },
                unique: true);
        }
    }
}
