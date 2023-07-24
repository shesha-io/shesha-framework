using FluentMigrator;
using Shesha.FluentMigrator;
using System;

namespace Shesha.Migrations.Framework
{
    [Migration(20230116151599), MsSqlOnly]
    public class M20230116151599 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Table("Frwk_Modules").AddColumn("FriendlyName").AsString(200).Nullable();
            Alter.Table("Frwk_Modules").AddColumn("Publisher").AsString(200).Nullable();
            Alter.Table("Frwk_Modules").AddColumn("IsEditable").AsBoolean().NotNullable().SetExistingRowsTo(true);
            Alter.Table("Frwk_Modules").AddColumn("IsRootModule").AsBoolean().NotNullable().SetExistingRowsTo(true);
            Alter.Table("Frwk_Modules").AddColumn("CurrentVersionNo").AsString(50).Nullable();
            
            Alter.Table("Frwk_Modules").AddColumn("FirstInitializedDate").AsDateTime().Nullable();
            Alter.Table("Frwk_Modules").AddColumn("LastInitializedDate").AsDateTime().Nullable();
        }
    }
}
