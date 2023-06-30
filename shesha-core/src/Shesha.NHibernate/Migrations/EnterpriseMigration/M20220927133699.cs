using FluentMigrator;
using Shesha.FluentMigrator;
using System;

namespace Shesha.Migrations.EnterpriseMigration
{
    [Migration(20220927133699), MsSqlOnly]
    public class M20220927133699 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Table("Frwk_ConfigurationItems")
                .AddForeignKeyColumn("OriginId", "Frwk_ConfigurationItems");

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
