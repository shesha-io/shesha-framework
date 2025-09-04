using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.ConfigurationStudio
{
    [Migration(20250623120899)]
    public class M20250623120899 : OneWayMigration
    {
        public override void Up()
        {
            IfDatabase("SqlServer").Execute.Sql(@"create or alter procedure frwk.set_module_id
	@module_id uniqueidentifier
AS
BEGIN
	EXEC sp_set_session_context 'app.module_id', @module_id, @read_only = 0;
END");
            IfDatabase("PostgreSql").Execute.Sql(@"CREATE OR REPLACE PROCEDURE frwk.set_module_id(
    module_id uuid
)
LANGUAGE plpgsql
AS $$
BEGIN
    PERFORM set_config('app.module_id', module_id::text, false);
END;
$$;");

            IfDatabase("SqlServer").Execute.Sql(@"create or alter function frwk.get_module_id()
RETURNS uniqueidentifier
AS
BEGIN
	DECLARE @result uniqueidentifier;

	select @result = cast(SESSION_CONTEXT(N'app.module_id') as uniqueidentifier)
	if (@result is null)
	begin
		-- search for root module assuming there must be only one
		set @result = (
			select 
			top 1 
				id	
			from 
				frwk.modules
			where
				is_root_module = 1
			order by name
		);
		-- cache module id in the session context
		if (@result is not null)
			EXEC sp_set_session_context 'app.module_id', @result, @read_only = 0;
	end

	RETURN @result;
END");
			IfDatabase("PostgreSql").Execute.Sql(@"CREATE OR REPLACE FUNCTION frwk.get_module_id()
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
    result uuid;
BEGIN
    -- Try to get the value from the session context.
    BEGIN
        result := current_setting('app.module_id', true)::uuid;
    EXCEPTION
        -- Catch exceptions for undefined_object (setting not found)
        -- or invalid_text_representation (if the value is not a valid UUID)
        WHEN others THEN 
            result := NULL;
    END;

    -- If the value was not found in the context, query the table.
    IF result IS NULL THEN
        -- search for root module assuming there must be only one
        SELECT 
            id
        INTO 
            result
        FROM 
            frwk.modules
        WHERE 
            is_root_module = true
        ORDER BY name
        LIMIT 1;

        -- cache module id in the session context if found
        IF result IS NOT NULL THEN
            PERFORM set_config('app.module_id', result::text, false);
        END IF;
    END IF;

    RETURN result;
END;
$$;");
        }
    }
}
