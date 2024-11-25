using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Elmah.Migrations
{
    [Migration(20240903123199)]
    public class M20240903123199 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Table("errors").InSchema("elmah").AddColumn("location").AsStringMax().Nullable();

			Execute.Sql(@"drop view elmah.vw_referenced_errors");
            Execute.Sql(@"create view elmah.vw_referenced_errors as 
select 
	ref.id,
	ref.ref_id, 
	ref.ref_type,
	err.error_id,
	err.application,
	err.host,
	err.source,
	err.status_code,
	err.time_utc,
	err.type,
	err.""user"",
	err.location
from 
	elmah.error_refs ref
	inner join elmah.errors err on err.error_id = ref.error_id");            
        }
    }
}
