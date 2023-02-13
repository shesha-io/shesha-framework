using FluentMigrator;
using System;

namespace Shesha.Migrations.Framework
{
    [Migration(20220209104399)]
    public class M20220209104399 : AutoReversingMigration
    {
        public override void Up()
        {
            Alter.Table("Frwk_EntityConfigs").AddColumn("PropertiesMD5").AsString(40).Nullable();
        }
    }
}
