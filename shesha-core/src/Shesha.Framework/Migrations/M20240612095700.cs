using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20240612095700)]
    public class M20240612095700 : OneWayMigration
    {
        public override void Up()
        {
            IfDatabase("SqlServer").Execute.Sql(@"
                DELETE sv 
                FROM [Frwk_SettingValues] sv
                JOIN Frwk_SettingConfigurations sc ON sv.SettingConfigurationId = sc.Id
                WHERE sc.Id IN (
                    SELECT 
                        ci.Id
                    FROM 
                        Frwk_ConfigurationItems ci
                    WHERE
                        ci.ItemType = 'setting-configuration'
                        AND (
                            ci.name LIKE 'Shesha.Security%'
                            OR ci.Name LIKE 'Abp.Zero.UserManagement%'
                            OR ci.Name LIKE 'Shesha.Otp%'
                            OR ci.Name LIKE 'Shesha.Sms.%'
                            OR ci.Name LIKE 'Shesha.Email.%'
                        )
                )
                AND (
                    sc.Category LIKE '%Authentication%'
                    OR sc.Category LIKE '%One Time Pins%'
                    OR sc.Category LIKE '%SMS%'
                    OR sc.Category LIKE '%Email%'
                );
            ");

            IfDatabase("SqlServer").Execute.Sql(@"
                DELETE FROM Frwk_SettingConfigurations WHERE Id IN (
                SELECT 
	                ci.Id
                FROM 
	                Frwk_ConfigurationItems ci
                WHERE
	                ci.ItemType = 'setting-configuration'
	                AND (
                            ci.name LIKE 'Shesha.Security%'
                            OR ci.Name LIKE 'Abp.Zero.UserManagement%'
                            OR ci.Name LIKE 'Shesha.Otp%'
                            OR ci.Name LIKE 'Shesha.Sms.%'
                            OR ci.Name LIKE 'Shesha.Email.%'
		                ))
                AND (    
                    Category LIKE '%Authentication%'
                    OR Category LIKE '%One Time Pins%'
                    OR Category LIKE '%SMS%'
                    OR Category LIKE '%Email%'
                );
            ");

            IfDatabase("SqlServer").Execute.Sql(@"
                DELETE ci
                FROM Frwk_ConfigurationItems ci
                JOIN Frwk_SettingConfigurations sc ON ci.Id = sc.Id
                WHERE sc.Id IN (
                    SELECT 
                        ci.Id
                    FROM 
                        Frwk_ConfigurationItems ci
                    WHERE
                        ci.ItemType = 'setting-configuration'
                        AND (
                            ci.name LIKE 'Shesha.Security%'
                            OR ci.Name LIKE 'Abp.Zero.UserManagement%'
                            OR ci.Name LIKE 'Shesha.Otp%'
                            OR ci.Name LIKE 'Shesha.Sms.%'
                            OR ci.Name LIKE 'Shesha.Email.%'


                        )
                )
                AND (
                    sc.Category LIKE '%Authentication%'
                    OR sc.Category LIKE '%One Time Pins%'
                    OR sc.Category LIKE '%SMS%'
                    OR sc.Category LIKE '%Email%'
                );
            ");

            // remove settings configuration without corresponding configurations
            // Step 1: Update referencing records to set OriginId and ParentVersionId to NULL
            Execute.Sql(@"
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
                )
            ");

            // Step 2: Delete target records
            Execute.Sql(@"
                DELETE FROM ""Frwk_ConfigurationItems""
                WHERE ""ItemType"" = 'setting-configuration'
                AND NOT EXISTS (SELECT 1 FROM ""Frwk_SettingConfigurations"" WHERE ""Id"" = ""Frwk_ConfigurationItems"".""Id"")
            ");
        }
    }
}
