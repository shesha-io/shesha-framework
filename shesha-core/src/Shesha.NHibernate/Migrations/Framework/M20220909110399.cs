using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.Framework
{
    [Migration(20220909110399), MsSqlOnly]
    public class M20220909110399 : OneWayMigration
    {
        public override void Up()
        {
            Execute.Sql(@"delete from Frwk_FormConfigurations"); // tables should be empty before this delete, it used for debug only
            Execute.Sql(@"delete from Frwk_ConfigurationItems");

            Create.Column("Label").OnTable("Frwk_ConfigurationItems").AsString(300).Nullable();
            Alter.Column("Name").OnTable("Frwk_ConfigurationItems").AsString(200).NotNullable();

            Execute.Sql(
@"create unique index 
	uq_Frwk_ConfigurationItems_Versioning 
on 
	Frwk_ConfigurationItems(Name, ModuleId, ItemType, VersionNo)
where 
	IsDeleted = 0");
        }
    }
}
