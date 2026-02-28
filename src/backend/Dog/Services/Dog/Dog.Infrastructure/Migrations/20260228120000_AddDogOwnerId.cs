using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Dog.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDogOwnerId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "OwnerId",
                table: "Dogs",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Dogs_OwnerId",
                table: "Dogs",
                column: "OwnerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Dogs_Owners_OwnerId",
                table: "Dogs",
                column: "OwnerId",
                principalTable: "Owners",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Dogs_Owners_OwnerId",
                table: "Dogs");

            migrationBuilder.DropIndex(
                name: "IX_Dogs_OwnerId",
                table: "Dogs");

            migrationBuilder.DropColumn(
                name: "OwnerId",
                table: "Dogs");
        }
    }
}
