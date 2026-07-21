using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SkillLink.Infrastructure.Migrations
{
    public partial class AgregarMensajesPrivados : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Mensajes_Usuarios_EmisorId",
                table: "Mensajes");

            migrationBuilder.AddForeignKey(
                name: "FK_Mensajes_Usuarios_EmisorId",
                table: "Mensajes",
                column: "EmisorId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Mensajes_Usuarios_EmisorId",
                table: "Mensajes");

            migrationBuilder.AddForeignKey(
                name: "FK_Mensajes_Usuarios_EmisorId",
                table: "Mensajes",
                column: "EmisorId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}