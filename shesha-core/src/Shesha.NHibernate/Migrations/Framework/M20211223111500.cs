using FluentMigrator;
using Shesha.FluentMigrator;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shesha.Migrations.Framework
{
    [Migration(20211223111500)]
    public class M20211223111500 : AutoReversingMigration
    {
        public override void Up()
        {
            Alter.Table("Frwk_EntityProperties").AddForeignKeyColumn("ParentPropertyId", "Frwk_EntityProperties").Nullable();            
        }
    }
}
