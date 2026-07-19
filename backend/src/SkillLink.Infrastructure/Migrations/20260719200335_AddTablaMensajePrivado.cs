using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SkillLink.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTablaMensajePrivado : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MensajesPrivados",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EmisorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ReceptorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Contenido = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Fecha = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MensajesPrivados", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MensajesPrivados_Usuarios_EmisorId",
                        column: x => x.EmisorId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MensajesPrivados_Usuarios_ReceptorId",
                        column: x => x.ReceptorId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MensajesPrivados_EmisorId_ReceptorId_Fecha",
                table: "MensajesPrivados",
                columns: new[] { "EmisorId", "ReceptorId", "Fecha" });

            migrationBuilder.CreateIndex(
                name: "IX_MensajesPrivados_ReceptorId",
                table: "MensajesPrivados",
                column: "ReceptorId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MensajesPrivados");
        }
    }
}
