using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.EnterpriseMigration
{
    [Migration(20221019162099), MsSqlOnly]
    public class M20221019162099 : OneWayMigration
    {
        public override void Up()
        {
			Execute.Sql(
@"with firstVersions as (
	select 
		Name,
		ModuleId,
		ItemType,
		Id
	from 
		Frwk_ConfigurationItems
	where
		VersionNo = 1
)
update 
	ci
set
	ci.OriginId = fv.Id
from
	Frwk_ConfigurationItems ci
	inner join firstVersions fv on fv.ItemType = ci.ItemType and (fv.ModuleId = ci.ModuleId or fv.ModuleId is null and ci.ModuleId is null) and fv.Name = ci.Name
where
	ci.OriginId is null");
		}
    }
}
