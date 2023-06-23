using FluentMigrator;
using Shesha.FluentMigrator;
using System;

namespace Shesha.Migrations.ConfigurationFramework
{
    [Migration(20221107115600), MsSqlOnly]
    public class M20221107115600 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Table("Frwk_EntityConfigs").AddColumn("ViewConfigurations").AsStringMax().Nullable();
            Alter.Table("Frwk_EntityConfigs").AddColumn("EntityConfigTypeLkp").AsInt32().NotNullable().WithDefaultValue(1);
        }
    }
}
