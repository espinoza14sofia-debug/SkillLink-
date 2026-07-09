using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SkillLink.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTablaNivelConfiguracion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "NivelConfiguraciones",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nivel = table.Column<int>(type: "int", nullable: false),
                    Titulo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    XpMinimo = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NivelConfiguraciones", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "NivelConfiguraciones",
                columns: new[] { "Id", "Nivel", "Titulo", "XpMinimo" },
                values: new object[,]
                {
                    { 1, 1, "Novato", 0 },
                    { 2, 5, "Colaborador", 400 },
                    { 3, 10, "Estratega", 900 },
                    { 4, 20, "Líder", 1900 },
                    { 5, 30, "Maestro", 2900 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "NivelConfiguraciones");
        }
    }
}
