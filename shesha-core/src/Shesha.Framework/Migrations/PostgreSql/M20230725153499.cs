using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.PostgreSql
{
    [Migration(20230725153499), PostgreSqlOnly]
    public class M20230725153499 : OneWayMigration
    {
        public override void Up()
        {
            Execute.Sql(
@"CREATE OR REPLACE FUNCTION public.""log_Frwk_UserLoginAttempts_UpdateLastLoginDate_AI""()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE NOT LEAKPROOF
AS $BODY$

BEGIN
	IF NEW.""UserId"" IS NOT NULL AND NEW.""ResultLkp"" = 1 THEN
		UPDATE ""AbpUsers""
		SET ""LastLoginDate"" = NEW.""CreationTime""
		WHERE ""Id"" = NEW.""UserId"";
	END IF;
	
	RETURN NEW;
END;
$BODY$;");
        }
    }
}
