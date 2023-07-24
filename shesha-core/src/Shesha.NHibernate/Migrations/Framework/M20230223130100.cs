using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.Framework
{
    [Migration(20230223130100), MsSqlOnly]
    public class M20230223130100 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Table("Frwk_EntityProperties").AddColumn("CascadeCreate").AsBoolean().WithDefaultValue(false).NotNullable();
            Alter.Table("Frwk_EntityProperties").AddColumn("CascadeUpdate").AsBoolean().WithDefaultValue(false).NotNullable();
            Alter.Table("Frwk_EntityProperties").AddColumn("CascadeDeleteUnreferenced").AsBoolean().WithDefaultValue(false).NotNullable();
        }
    }
}
