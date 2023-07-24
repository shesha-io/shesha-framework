using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.Framework
{
    [Migration(20221010101000), MsSqlOnly]
    public class M20221010101000 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Table("Frwk_EntityProperties").AddColumn("Suppress").AsBoolean().WithDefaultValue(false).NotNullable();
            Alter.Table("Frwk_EntityProperties").AddColumn("Required").AsBoolean().WithDefaultValue(false).NotNullable();
            Alter.Table("Frwk_EntityProperties").AddColumn("ReadOnly").AsBoolean().WithDefaultValue(false).NotNullable();
            Alter.Table("Frwk_EntityProperties").AddColumn("Audited").AsBoolean().WithDefaultValue(false).NotNullable();
            Alter.Table("Frwk_EntityProperties").AddColumn("Min").AsDouble().Nullable();
            Alter.Table("Frwk_EntityProperties").AddColumn("Max").AsDouble().Nullable();
            Alter.Table("Frwk_EntityProperties").AddColumn("MinLength").AsInt32().Nullable();
            Alter.Table("Frwk_EntityProperties").AddColumn("MaxLength").AsInt32().Nullable();
            Alter.Table("Frwk_EntityProperties").AddColumn("RegExp").AsString(512).Nullable();
            Alter.Table("Frwk_EntityProperties").AddColumn("ValidationMessage").AsString(1023).Nullable();
        }
    }
}
