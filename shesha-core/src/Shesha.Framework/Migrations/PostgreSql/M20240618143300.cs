using FluentMigrator;
using Shesha.FluentMigrator;
using System;

namespace Shesha.Migrations.PostgreSql
{
    [Migration(20240618143300)]
    public class M20240618143300 : OneWayMigration
    {
        public override void Up()
        {
            IfDatabase("PostgreSql").Execute.Sql(@"
                DELETE FROM ""Frwk_SettingValues"" sv
                USING ""Frwk_SettingConfigurations"" sc
                WHERE sv.""SettingConfigurationId"" = sc.""Id""
                AND sc.""Id"" IN (
                    SELECT ci.""Id""
                    FROM ""Frwk_ConfigurationItems"" ci
                    WHERE ci.""ItemType"" = 'setting-configuration'
                    AND (
                        ci.""Name"" LIKE 'Shesha.Security%'
                        OR ci.""Name"" LIKE 'Abp.Zero.UserManagement%'
                        OR ci.""Name"" LIKE 'Shesha.Otp%'
                        OR ci.""Name"" LIKE 'Shesha.Sms.%'
                        OR ci.""Name"" LIKE 'Shesha.Email.%'
                    )
                )
                AND (
                    sc.""Category"" LIKE '%Authentication%'
                    OR sc.""Category"" LIKE '%One Time Pins%'
                    OR sc.""Category"" LIKE '%SMS%'
                    OR sc.""Category"" LIKE '%Email%'
                );
            ");

            IfDatabase("PostgreSql").Execute.Sql(@"
                DELETE FROM ""Frwk_SettingConfigurations""
                WHERE ""Id"" IN (
                    SELECT ci.""Id""
                    FROM ""Frwk_ConfigurationItems"" ci
                    WHERE ci.""ItemType"" = 'setting-configuration'
                    AND (
                        ci.""Name"" LIKE 'Shesha.Security%'
                        OR ci.""Name"" LIKE 'Abp.Zero.UserManagement%'
                        OR ci.""Name"" LIKE 'Shesha.Otp%'
                        OR ci.""Name"" LIKE 'Shesha.Sms.%'
                        OR ci.""Name"" LIKE 'Shesha.Email.%'
                    )
                )
                AND (
                    ""Category"" LIKE '%Authentication%'
                    OR ""Category"" LIKE '%One Time Pins%'
                    OR ""Category"" LIKE '%SMS%'
                    OR ""Category"" LIKE '%Email%'
                );
            ");

            IfDatabase("PostgreSql").Execute.Sql(@"
                DELETE FROM ""Frwk_ConfigurationItems"" ci
                USING ""Frwk_SettingConfigurations"" sc
                WHERE ci.""Id"" = sc.""Id""
                AND sc.""Id"" IN (
                    SELECT ci2.""Id""
                    FROM ""Frwk_ConfigurationItems"" ci2
                    WHERE ci2.""ItemType"" = 'setting-configuration'
                    AND (
                        ci2.""Name"" LIKE 'Shesha.Security%'
                        OR ci2.""Name"" LIKE 'Abp.Zero.UserManagement%'
                        OR ci2.""Name"" LIKE 'Shesha.Otp%'
                        OR ci2.""Name"" LIKE 'Shesha.Sms.%'
                        OR ci2.""Name"" LIKE 'Shesha.Email.%'
                    )
                )
                AND (
                    sc.""Category"" LIKE '%Authentication%'
                    OR sc.""Category"" LIKE '%One Time Pins%'
                    OR sc.""Category"" LIKE '%SMS%'
                    OR sc.""Category"" LIKE '%Email%'
                );
            ");

            IfDatabase("PostgreSql").Execute.Sql(@"
                UPDATE ""Frwk_ConfigurationItems""
                SET ""OriginId"" = NULL, ""ParentVersionId"" = NULL
                WHERE ""OriginId"" IN (
                    SELECT ""Id"" FROM ""Frwk_ConfigurationItems""
                    WHERE ""ItemType"" = 'setting-configuration'
                    AND NOT EXISTS (SELECT 1 FROM ""Frwk_SettingConfigurations"" WHERE ""Id"" = ""Frwk_ConfigurationItems"".""Id"")
                )
                OR ""ParentVersionId"" IN (
                    SELECT ""Id"" FROM ""Frwk_ConfigurationItems""
                    WHERE ""ItemType"" = 'setting-configuration'
                    AND NOT EXISTS (SELECT 1 FROM ""Frwk_SettingConfigurations"" WHERE ""Id"" = ""Frwk_ConfigurationItems"".""Id"")
                );
            ");

            IfDatabase("PostgreSql").Execute.Sql(@"
                DELETE FROM ""Frwk_ConfigurationItems""
                WHERE ""ItemType"" = 'setting-configuration'
                AND NOT EXISTS (
                    SELECT 1
                    FROM ""Frwk_SettingConfigurations""
                    WHERE ""Id"" = ""Frwk_ConfigurationItems"".""Id""
                );
            ");
        }
    }
}
