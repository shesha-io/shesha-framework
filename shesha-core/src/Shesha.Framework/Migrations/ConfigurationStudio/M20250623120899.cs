using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.ConfigurationStudio
{
    [Migration(20250623120899)]
    public class M20250623120899 : OneWayMigration
    {
        public override void Up()
        {
            Execute.Sql(@"create or alter procedure frwk.set_module_id
	@module_id uniqueidentifier
AS
BEGIN
	EXEC sp_set_session_context 'app.module_id', @module_id, @read_only = 0;
END");

            Execute.Sql(@"create or alter function frwk.get_module_id()
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
        }
    }
}
