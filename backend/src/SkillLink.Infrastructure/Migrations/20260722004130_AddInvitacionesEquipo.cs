using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SkillLink.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddInvitacionesEquipo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "InvitacionesEquipo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EquipoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UsuarioInvitadoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UsuarioInvitaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Estado = table.Column<int>(type: "int", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InvitacionesEquipo", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InvitacionesEquipo_Equipos_EquipoId",
                        column: x => x.EquipoId,
                        principalTable: "Equipos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InvitacionesEquipo_Usuarios_UsuarioInvitaId",
                        column: x => x.UsuarioInvitaId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InvitacionesEquipo_Usuarios_UsuarioInvitadoId",
                        column: x => x.UsuarioInvitadoId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_InvitacionesEquipo_EquipoId",
                table: "InvitacionesEquipo",
                column: "EquipoId");

            migrationBuilder.CreateIndex(
                name: "IX_InvitacionesEquipo_UsuarioInvitadoId",
                table: "InvitacionesEquipo",
                column: "UsuarioInvitadoId");

            migrationBuilder.CreateIndex(
                name: "IX_InvitacionesEquipo_UsuarioInvitaId",
                table: "InvitacionesEquipo",
                column: "UsuarioInvitaId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InvitacionesEquipo");
        }
    }
}