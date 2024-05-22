using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Elmah.Migrations
{
    [Migration(20240520141099)]
    public class M20240520141099 : OneWayMigration
    {
        public override void Up()
        {
            Execute.Sql(@"create view [elmah].[vw_referenced_errors] as 
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
	err.""user""
from 
	elmah.error_refs ref
	inner join elmah.errors err on err.error_id = ref.error_id");
        }
    }
}
