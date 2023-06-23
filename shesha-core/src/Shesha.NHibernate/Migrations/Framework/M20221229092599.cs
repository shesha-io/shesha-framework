using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.Framework
{
    [Migration(20221229092599), MsSqlOnly]
    public class M20221229092599 : OneWayMigration
    {
        public override void Up()
        {
            Create.Column("AppKey").OnTable("Frwk_FrontEndApps").AsString(100).Nullable();

            Execute.Sql(
@"with data as (
	select
		Id,
		(Name + cast(ROW_NUMBER() over (partition by Name order by CreationTime) as varchar(5))) as AppKey
	from
		Frwk_FrontEndApps
)
update
	app
set
	AppKey = data.AppKey
from
	Frwk_FrontEndApps app
	inner join data on data.Id = app.Id");

            Alter.Column("AppKey").OnTable("Frwk_FrontEndApps").AsString(100).NotNullable();

            Execute.Sql("create unique index uq_Frwk_FrontEndApps_Name on Frwk_FrontEndApps(AppKey) where IsDeleted=0");

            Alter.Table("Frwk_ConfigurationItems").AddForeignKeyColumn("ApplicationId", "Frwk_FrontEndApps");            
        }
    }
}
