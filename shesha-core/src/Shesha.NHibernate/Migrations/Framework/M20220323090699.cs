using FluentMigrator;
using Shesha.FluentMigrator;
using System;

namespace Shesha.Migrations.Framework
{
    [Migration(20220323090699)]
    public class M20220323090699 : AutoReversingMigration
    {
        public override void Up()
        {
            Alter.Table("Frwk_EntityProperties").AddForeignKeyColumn("ItemsTypeId", "Frwk_EntityProperties");
        }
    }
}
