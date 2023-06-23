using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.ConfigurationFramework
{
    [Migration(20230113091499), MsSqlOnly]
    public class M20230113091499 : OneWayMigration
    {
        public override void Up()
        {
            Execute.Sql("drop index Frwk_ConfigurationItems.uq_Frwk_ConfigurationItems_LiveVersion");
            Execute.Sql("create unique index uq_Frwk_ConfigurationItems_LiveVersion on Frwk_ConfigurationItems(Name, ModuleId, ApplicationId, ItemType, TenantId) where IsDeleted=0 and VersionStatusLkp = 3");

            Execute.Sql("drop index Frwk_ConfigurationItems.uq_Frwk_ConfigurationItems_Versioning");
            Execute.Sql(
@"create unique index 
	uq_Frwk_ConfigurationItems_Versioning 
on 
	Frwk_ConfigurationItems(Name, ModuleId, ApplicationId, ItemType, VersionNo)
where 
	IsDeleted = 0");

        }
    }
}
