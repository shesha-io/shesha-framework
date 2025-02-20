using FluentMigrator;
using Shesha.FluentMigrator;
using System;

namespace Shesha.Migrations
{
    [Migration(20240501134000)]
    public class M20240501134000 : OneWayMigration
    {
        public override void Up()
        {
            IfDatabase("PostgreSql").Execute.Sql(@"CREATE OR REPLACE FUNCTION public.""log_Frwk_ConfigurationItems_UpdateIsLast_AI""()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare
    v_cnt numeric;
    toupdate numeric;
BEGIN
    v_cnt := 0;
	
    UPDATE ""Frwk_ConfigurationItems"" item
    SET ""IsLast"" = false
    FROM inserted 
    WHERE 
        item.""IsLast"" = true
        AND (inserted.""ModuleId"" = item.""ModuleId"" OR (inserted.""ModuleId"" IS NULL AND item.""ModuleId"" IS NULL))
            AND inserted.""Name"" = item.""Name""
            AND inserted.""ItemType"" = item.""ItemType""
			AND item.""Id"" <> (
            SELECT ""Id""
            FROM ""Frwk_ConfigurationItems"" lastVersions
            WHERE lastVersions.""IsDeleted"" = false
                AND (lastVersions.""ModuleId"" = item.""ModuleId"" OR (lastVersions.""ModuleId"" IS NULL AND item.""ModuleId"" IS NULL))
                AND lastVersions.""Name"" = item.""Name""
                AND lastVersions.""ItemType"" = item.""ItemType""
            ORDER BY lastVersions.""VersionNo"" DESC
            LIMIT 1
    );
	
    GET DIAGNOSTICS v_cnt = ROW_COUNT;
    Raise notice 'set IsLast = false: %', (v_cnt);
	
    v_cnt := 0;
    UPDATE ""Frwk_ConfigurationItems"" item
    SET ""IsLast"" = true
    FROM inserted  
    WHERE item.""IsLast"" = false
        AND (inserted.""ModuleId"" = item.""ModuleId"" OR (inserted.""ModuleId"" IS NULL AND item.""ModuleId"" IS NULL))
            AND inserted.""Name"" = item.""Name""
            AND inserted.""ItemType"" = item.""ItemType""
			AND item.""Id"" = (
            SELECT ""Id""
            FROM ""Frwk_ConfigurationItems"" lastVersions
            WHERE lastVersions.""IsDeleted"" = false
                AND (lastVersions.""ModuleId"" = item.""ModuleId"" OR (lastVersions.""ModuleId"" IS NULL AND item.""ModuleId"" IS NULL))
                AND lastVersions.""Name"" = item.""Name""
                AND lastVersions.""ItemType"" = item.""ItemType""
            ORDER BY lastVersions.""VersionNo"" DESC
            LIMIT 1
        );
		
    GET DIAGNOSTICS v_cnt = ROW_COUNT;
    Raise notice 'set IsLast = true: %', (v_cnt);
	
    RETURN null;
END;
$function$
;");
        }
    }
}
