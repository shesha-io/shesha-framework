using FluentMigrator;
using Shesha.FluentMigrator;
using System;

namespace Shesha.Migrations
{
    [Migration(20240402202800)]
    public class M20240402202800 : Migration
    {
        /// <summary>
        /// 
        /// </summary>
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
                            ci.name LIKE 'GatewaySettings%'
                            OR ci.Name LIKE 'Shesha.AzureAD%'
                            OR ci.Name LIKE 'Shesha.Ldap%'
                            OR ci.Name LIKE 'Shesha.Firebase%'
                            OR ci.Name LIKE 'Shesha.Push%' 
                            OR ci.Name LIKE '%ExchangeName%'
                        )
                )
                AND (
                    sc.Category LIKE '%SMS Portal%'
                    OR sc.Category LIKE '%Bulk SMS%'
                    OR sc.Category LIKE '%Xml2Sms%'
                    OR sc.Category LIKE '%Azure AD%'
                    OR sc.Category LIKE '%LDAP%'
                    OR sc.Category LIKE '%Firebase%'
                    OR sc.Category LIKE '%Push%'
                    OR sc.Category LIKE '%RabbitMQ%'
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
							ci.name like 'GatewaySettings%'
							OR ci.Name like 'Shesha.AzureAD%'
							OR ci.Name like 'Shesha.Ldap%'
							OR ci.Name like 'Shesha.Firebase%'
							OR ci.Name like 'Shesha.Push%' 
							OR ci.Name like '%ExchangeName%'
							))
				  AND (Category like '%SMS Portal%'
						OR Category like '%Bulk SMS%'
						OR Category like '%Xml2Sms%'
						OR Category like '%Azure AD%'
						OR Category like '%LDAP%'
						OR Category like '%Firebase%'
						OR Category like '%Push%'
						OR Category like '%RabbitMQ%'
					)
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
                            ci.name LIKE 'GatewaySettings%'
                            OR ci.Name LIKE 'Shesha.AzureAD%'
                            OR ci.Name LIKE 'Shesha.Ldap%'
                            OR ci.Name LIKE 'Shesha.Firebase%'
                            OR ci.Name LIKE 'Shesha.Push%' 
                            OR ci.Name LIKE '%ExchangeName%'
                        )
                )
                AND (
                    sc.Category LIKE '%SMS Portal%'
                    OR sc.Category LIKE '%Bulk SMS%'
                    OR sc.Category LIKE '%Xml2Sms%'
                    OR sc.Category LIKE '%Azure AD%'
                    OR sc.Category LIKE '%LDAP%'
                    OR sc.Category LIKE '%Firebase%'
                    OR sc.Category LIKE '%Push%'
                    OR sc.Category LIKE '%RabbitMQ%'
                );
            ");

            // remove settings configuration without corresponding configurations
            Execute.Sql(@"delete from 
	            Frwk_ConfigurationItems
                WHERE
	            ItemType = 'setting-configuration'
	            AND NOT EXISTS (select 1 from Frwk_SettingConfigurations where Id = Frwk_ConfigurationItems.Id)");
        }

        /// <summary>
        /// 
        /// </summary>
        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
