using FluentMigrator;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
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

        private void ExecuteMigration(IDbConnection connection, IDbTransaction transaction, bool useSqlServerSyntax)
        {
            // Create a PasswordHasher instance to verify passwords
            // This uses the same default configuration as HostRoleAndUserBuilder.cs:88
            var passwordHasher = new PasswordHasher<DummyUser>(
                new OptionsWrapper<PasswordHasherOptions>(new PasswordHasherOptions())
            );

            // Query only the admin user (userId = 1)
            using var selectCommand = connection.CreateCommand();
            selectCommand.Transaction = transaction;

            // Different boolean syntax for SQL Server vs PostgreSQL
            var isDeletedCheck = useSqlServerSyntax ? "IsDeleted = 0" : "\"IsDeleted\" = false";
            var idColumn = useSqlServerSyntax ? "Id" : "\"Id\"";
            var userNameColumn = useSqlServerSyntax ? "UserName" : "\"UserName\"";
            var passwordColumn = useSqlServerSyntax ? "Password" : "\"Password\"";
            var tableName = useSqlServerSyntax ? "AbpUsers" : "\"AbpUsers\"";

            selectCommand.CommandText = $@"
                SELECT {userNameColumn}, {passwordColumn}
                FROM {tableName}
                WHERE {idColumn} = 1
                AND {isDeletedCheck}
                AND {passwordColumn} IS NOT NULL";

            using var reader = selectCommand.ExecuteReader();
            bool shouldUpdate = false;

            if (reader.Read())
            {
                var userName = reader.IsDBNull(0) ? "" : reader.GetString(0);
                var hashedPassword = reader.IsDBNull(1) ? "" : reader.GetString(1);

                if (!string.IsNullOrEmpty(hashedPassword))
                {
                    // Create a dummy user to verify the password
                    var dummyUser = new DummyUser { UserName = userName };

                    try
                    {
                        // Verify if the password is "123qwe"
                        var result = passwordHasher.VerifyHashedPassword(
                            dummyUser,
                            hashedPassword,
                            "123qwe"
                        );

                        if (result == PasswordVerificationResult.Success ||
                            result == PasswordVerificationResult.SuccessRehashNeeded)
                        {
                            shouldUpdate = true;
                        }
                    }
                    catch (Exception ex)
                    {
                        // Log the failure so operators can see that the flag wasn't set
                        Console.WriteLine($"WARNING: Failed to verify password for admin user (Id=1). RequireChangePassword flag will not be set. Error: {ex.Message}");
                    }
                }
            }
            // Update RequireChangePassword for admin user if password is still default
            if (shouldUpdate)
            {
                using var updateCommand = connection.CreateCommand();
                updateCommand.Transaction = transaction;

                var requireChangePasswordColumn = useSqlServerSyntax ? "RequireChangePassword" : "\"RequireChangePassword\"";
                var boolValue = useSqlServerSyntax ? "1" : "true";

                updateCommand.CommandText = $@"
                    UPDATE {tableName}
                    SET {requireChangePasswordColumn} = {boolValue}
                    WHERE {idColumn} = 1";

                var rowsAffected = updateCommand.ExecuteNonQuery();
                System.Console.WriteLine($"Set RequireChangePassword=true for admin user (Id=1) with default password");
            }
        }

        // Dummy user class for password verification
        private class DummyUser
        {
            public string UserName { get; set; }
        }
    }
}
