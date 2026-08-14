using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20260814145999)]
    public class M20260814145999 : OneWayMigration
    {
        public override void Up()
        {
            IfDatabase("SqlServer").Execute.Sql(@"CREATE PROCEDURE frwk.check_db_health
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Messages TABLE (Message NVARCHAR(MAX));

    -- 1) Disabled triggers (on tables only)
    INSERT INTO @Messages (Message)
    SELECT 'Trigger ' + 
           QUOTENAME(OBJECT_SCHEMA_NAME(object_id)) + '.' + 
           QUOTENAME(name) + ' is DISABLED.'
    FROM sys.triggers
    WHERE is_disabled = 1
      AND parent_class = 1;   -- table triggers only

    -- 2) Disabled foreign keys
    INSERT INTO @Messages (Message)
    SELECT 'Foreign key ' + 
           QUOTENAME(OBJECT_SCHEMA_NAME(object_id)) + '.' + 
           QUOTENAME(name) + ' is DISABLED.'
    FROM sys.foreign_keys
    WHERE is_disabled = 1;

    -- 3) Foreign keys that are NOT TRUSTED (inactive for validation)
    INSERT INTO @Messages (Message)
    SELECT 'Foreign key ' + 
           QUOTENAME(OBJECT_SCHEMA_NAME(object_id)) + '.' + 
           QUOTENAME(name) + ' is NOT TRUSTED.'
    FROM sys.foreign_keys
    WHERE is_not_trusted = 1;

    SELECT Message FROM @Messages;
END");

            IfDatabase("PostgreSql").Execute.Sql(@"CREATE OR REPLACE FUNCTION frwk.check_db_health()
RETURNS TABLE(Message TEXT) AS
$$
BEGIN
    -- 1) Disabled triggers (user triggers only, exclude internal)
    RETURN QUERY
    SELECT 'Trigger ' || quote_ident(n.nspname) || '.' || quote_ident(tgname) || ' is DISABLED.'
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE t.tgenabled = 'D'          -- 'D' = disabled
      AND t.tgisinternal = false;    -- user-defined triggers

    -- 2) Foreign key constraints that are NOT VALIDATED (not enforced)
    RETURN QUERY
    SELECT 'Foreign key constraint ' || quote_ident(n.nspname) || '.' || quote_ident(conname) || ' is NOT VALIDATED (inactive).'
    FROM pg_constraint con
    JOIN pg_class c ON con.conrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE con.contype = 'f'          -- foreign key
      AND con.convalidated = false;  -- not fully validated

    -- Note: PostgreSQL does not have a separate ""disabled"" flag for FK constraints.
    -- A FK can be made ""not valid"" with ALTER TABLE ... ADD CONSTRAINT ... NOT VALID,
    -- which is effectively inactive until validated.
END;
$$ LANGUAGE plpgsql;");
        }
    }
}
