using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.Framework
{
    [Migration(20221226093399), MsSqlOnly]
    public class M20221226093399 : OneWayMigration
    {
        public override void Up()
        {
            Create.Column("Namespace").OnTable("Frwk_ReferenceLists").AsString(300).Nullable();

            Execute.Sql(
@"update
	list
set
	Namespace = ci.Namespace
from
	Frwk_ReferenceLists list
	inner join Frwk_ConfigurationItems ci on ci.Id = list.Id");

            Execute.Sql(
@"update
	ci
set
	Name = (case when ci.Namespace is not null and ci.Namespace <> '' then ci.Namespace + '.' + ci.Name else ci.Name end)
from
	Frwk_ReferenceLists list
	inner join Frwk_ConfigurationItems ci on ci.Id = list.Id");

            Execute.Sql("drop index Frwk_ConfigurationItems.uq_Frwk_ConfigurationItems_LiveVersion");
            Execute.Sql("create unique index uq_Frwk_ConfigurationItems_LiveVersion on Frwk_ConfigurationItems(Name, ModuleId, TenantId) where IsDeleted=0 and VersionStatusLkp = 3");

            Execute.Sql("drop index Frwk_ConfigurationItems.uq_Frwk_ConfigurationItems_Versioning");
            Execute.Sql(
@"create unique index 
	uq_Frwk_ConfigurationItems_Versioning 
on 
	Frwk_ConfigurationItems(Name, ModuleId, ItemType, VersionNo)
where 
	IsDeleted = 0");

            Delete.Column("Namespace").FromTable("Frwk_ConfigurationItems");
        }
    }
}
