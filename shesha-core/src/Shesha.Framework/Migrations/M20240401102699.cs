using FluentMigrator;
using Shesha.FluentMigrator;
using System;

namespace Shesha.Migrations
{
    [Migration(20240401102699)]
    public class M20240401102699 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Table("Frwk_Modules").AddColumn("Accessor").AsString(200).Nullable();
            Alter.Table("Frwk_EntityConfigs").AddColumn("Accessor").AsString(200).Nullable();            
        }
    }
}
