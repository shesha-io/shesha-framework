using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Web.FormsDesigner.Migrations
{
    [Migration(20221201151599), MsSqlOnly]
    public class M20221201151599 : OneWayMigration
    {
        public override void Up()
        {
            Execute.Sql(
@"with liveItems as (
	select
		ci.Id,
		ci.Name,
		ci.ItemType,
		ci.ModuleId,
		m.Name as Module,
		ci.VersionStatusLkp,
		ci.CreationTime,
		ci.IsLast
	from
		Frwk_ConfigurationItems ci
		left join Frwk_Modules m on m.Id = ci.ModuleId
	where
		ci.VersionStatusLkp = 3 /*live*/
		and ci.IsDeleted = 0
)
update
	Frwk_ConfigurationItems
set
	VersionStatusLkp = 5 /*retired*/
where
	Id in (
		select 
			wrongLive.Id 
		from 
			liveItems wrongLive
		where
			exists (
				select 
					1 
				from 
					liveItems latestLive
				where
					wrongLive.Name = latestLive.Name
					and coalesce(wrongLive.ModuleId, 0x0) = coalesce(latestLive.ModuleId, 0x0)
					and wrongLive.Id <> latestLive.Id
					and wrongLive.CreationTime < latestLive.CreationTime
			)
	)");

			Execute.Sql("create unique index uq_Frwk_ConfigurationItems_LiveVersion on Frwk_ConfigurationItems(Name, ModuleId, TenantId) where IsDeleted=0 and VersionStatusLkp = 3");
        }
    }
}
