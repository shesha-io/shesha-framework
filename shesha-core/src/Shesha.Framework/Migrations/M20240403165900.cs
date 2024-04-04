using FluentMigrator;
using Shesha.FluentMigrator;
using System;

namespace Shesha.Migrations
{
    [Migration(20240403165900)]
    public class M20240403165900 : Migration
    {
        /// <summary>
        /// 
        /// </summary>
        public override void Up()
        {
            IfDatabase("SqlServer").Execute.Sql(@"
                DELETE sc
                FROM 
                Frwk_SettingConfigurations sc
                INNER JOIN [Frwk_ConfigurationItems] ci  ON ci.Id = sc.Id
                WHERE ci.ModuleId in (
                    SELECT Id
                    FROM 
	                    Frwk_Modules
                    WHERE
                    (
	                    name like 'Shesha.Enterprise%'
	                    OR Name like 'Shesha.AzureAD%'
	                    OR Name like 'Shesha.Ldap%'
	                    OR Name like 'Shesha.Firebase%'
	                    OR Name like 'Shesha.SmsPortal%'
	                    OR Name like 'Shesha.BulkSms%'
	                    OR Name like 'Shesha.Xml2Sms%'
                ))
            ");

            IfDatabase("SqlServer").Execute.Sql(@"
                DELETE fc
                FROM 
                [Frwk_FormConfigurations] fc
                INNER JOIN [Frwk_ConfigurationItems] ci  ON ci.Id = fc.Id
                WHERE ci.ModuleId in (
                    SELECT Id
                    FROM 
	                    Frwk_Modules
                    WHERE
                    (
	                    name like 'Shesha.Enterprise%'
	                    OR Name like 'Shesha.AzureAD%'
	                    OR Name like 'Shesha.Ldap%'
	                    OR Name like 'Shesha.Firebase%'
	                    OR Name like 'Shesha.SmsPortal%'
	                    OR Name like 'Shesha.BulkSms%'
	                    OR Name like 'Shesha.Xml2Sms%'
                ))
            ");

            IfDatabase("SqlServer").Execute.Sql(@"
                DELETE ci
                FROM 
                Frwk_ConfigurationItems ci
                INNER JOIN Frwk_Modules m  ON m.Id = ci.ModuleId
                WHERE m.Id in (
                    SELECT Id
                    FROM 
	                    Frwk_Modules
                    WHERE
                    (
	                    name like 'Shesha.Enterprise%'
	                    OR Name like 'Shesha.AzureAD%'
	                    OR Name like 'Shesha.Ldap%'
	                    OR Name like 'Shesha.Firebase%'
	                    OR Name like 'Shesha.SmsPortal%'
	                    OR Name like 'Shesha.BulkSms%'
	                    OR Name like 'Shesha.Xml2Sms%'
                ))
            ");

            IfDatabase("SqlServer").Execute.Sql(@"
                    DELETE
                    FROM 
	                    Frwk_Modules
                    WHERE
                    (
	                    name like 'Shesha.Enterprise%'
	                    OR Name like 'Shesha.AzureAD%'
	                    OR Name like 'Shesha.Ldap%'
	                    OR Name like 'Shesha.Firebase%'
	                    OR Name like 'Shesha.SmsPortal%'
	                    OR Name like 'Shesha.BulkSms%'
	                    OR Name like 'Shesha.Xml2Sms%'
                    )
            ");
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
