using FluentMigrator;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Shesha.FluentMigrator;
using System.Collections.Generic;
using System.Data;

namespace Shesha.Migrations
{
    /// <summary>
    /// #4614: the seeded `admin`, `dev` and `config` accounts were created with a well known default
    /// password and no forced reset. `HostRoleAndUserBuilder` now sets `RequireChangePassword` when it
    /// creates them, but databases seeded before that change still hold the default, so flag any of the
    /// three that do.
    ///
    /// M20250127103000 already did this, but only for `Id = 1`, which left `dev` and `config` untouched.
    ///
    /// The stored password is salted by ASP.NET Identity, so the same plain text produces a different
    /// hash for every user and it cannot be matched with a literal comparison. Each candidate row is
    /// verified with the same `PasswordHasher` configuration the seeder uses; anything else is left alone.
    /// </summary>
    [Migration(20260828112399)]
    public class M20260828112399 : OneWayMigration
    {
        public override void Up()
        {
            IfDatabase("SqlServer").Execute.WithConnection((connection, transaction) =>
            {
                FlagDefaultUsers(connection, transaction, useSqlServerSyntax: true);
            });

            IfDatabase("PostgreSql").Execute.WithConnection((connection, transaction) =>
            {
                FlagDefaultUsers(connection, transaction, useSqlServerSyntax: false);
            });
        }

        private void FlagDefaultUsers(IDbConnection connection, IDbTransaction transaction, bool useSqlServerSyntax)
        {
            // same configuration as HostRoleAndUserBuilder uses when it seeds the accounts
            var passwordHasher = new PasswordHasher<DefaultUser>(
                new OptionsWrapper<PasswordHasherOptions>(new PasswordHasherOptions())
            );

            var tableName = useSqlServerSyntax ? "AbpUsers" : "\"AbpUsers\"";
            var idColumn = useSqlServerSyntax ? "Id" : "\"Id\"";
            var userNameColumn = useSqlServerSyntax ? "UserName" : "\"UserName\"";
            var passwordColumn = useSqlServerSyntax ? "Password" : "\"Password\"";
            var requireChangeColumn = useSqlServerSyntax ? "RequireChangePassword" : "\"RequireChangePassword\"";
            var isDeletedCheck = useSqlServerSyntax ? "IsDeleted = 0" : "\"IsDeleted\" = false";
            var trueValue = useSqlServerSyntax ? "1" : "true";

            var idsToFlag = new List<long>();

            using (var selectCommand = connection.CreateCommand())
            {
                selectCommand.Transaction = transaction;
                selectCommand.CommandText = $@"
                    SELECT {idColumn}, {userNameColumn}, {passwordColumn}
                    FROM {tableName}
                    WHERE {userNameColumn} IN ('admin', 'dev', 'config')
                    AND {isDeletedCheck}
                    AND {passwordColumn} IS NOT NULL";

                using var reader = selectCommand.ExecuteReader();
                while (reader.Read())
                {
                    var userId = reader.GetInt64(0);
                    var userName = reader.IsDBNull(1) ? string.Empty : reader.GetString(1);
                    var hashedPassword = reader.IsDBNull(2) ? string.Empty : reader.GetString(2);

                    if (string.IsNullOrEmpty(hashedPassword))
                        continue;

                    try
                    {
                        var result = passwordHasher.VerifyHashedPassword(
                            new DefaultUser { UserName = userName },
                            hashedPassword,
                            "123qwe"
                        );

                        if (result == PasswordVerificationResult.Success ||
                            result == PasswordVerificationResult.SuccessRehashNeeded)
                        {
                            idsToFlag.Add(userId);
                        }
                    }
                    catch
                    {
                        // unrecognised hash format, leave the account untouched
                    }
                }
            }

            foreach (var userId in idsToFlag)
            {
                using var updateCommand = connection.CreateCommand();
                updateCommand.Transaction = transaction;
                updateCommand.CommandText = $@"
                    UPDATE {tableName}
                    SET {requireChangeColumn} = {trueValue}
                    WHERE {idColumn} = {userId}";
                updateCommand.ExecuteNonQuery();
            }
        }

        /// <summary>
        /// Placeholder for the password hasher, which only needs a reference type to verify against.
        /// </summary>
        private class DefaultUser
        {
            public string UserName { get; set; } = string.Empty;
        }
    }
}
