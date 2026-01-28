using FluentMigrator;
using Shesha.FluentMigrator;
using System;
using System.Data;

namespace Shesha.Migrations
{
    [Migration(20250127103000)]
    public class M20250127103000 : OneWayMigration
    {
        public override void Up()
        {
            // SQL Server version
            IfDatabase("SqlServer").Execute.WithConnection((connection, transaction) =>
            {
                ExecuteMigration(connection, transaction, useSqlServerSyntax: true);
            });

            // PostgreSQL version
            IfDatabase("PostgreSql").Execute.WithConnection((connection, transaction) =>
            {
                ExecuteMigration(connection, transaction, useSqlServerSyntax: false);
            });
        }

        private static void ExecuteMigration(IDbConnection connection, IDbTransaction transaction, bool useSqlServerSyntax)
        {
            // Different boolean syntax for SQL Server vs PostgreSQL
            var idColumn = useSqlServerSyntax ? "Id" : "\"Id\"";
            var tableName = useSqlServerSyntax ? "AbpUsers" : "\"AbpUsers\"";
            var requireChangePasswordColumn = useSqlServerSyntax ? "RequireChangePassword" : "\"RequireChangePassword\"";
            var boolValue = useSqlServerSyntax ? "1" : "true";

            // Set RequireChangePassword for default admin user (Id=1)
            using var updateCommand = connection.CreateCommand();
            updateCommand.Transaction = transaction;

            updateCommand.CommandText = $@"
                UPDATE {tableName}
                SET {requireChangePasswordColumn} = {boolValue}
                WHERE {idColumn} = 1";

            var rowsAffected = updateCommand.ExecuteNonQuery();
            if (rowsAffected > 0)
            {
                Console.WriteLine($"Set RequireChangePassword=true for admin user (Id=1)");
            }
        }
    }
}
