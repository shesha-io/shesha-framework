using FluentMigrator;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shesha.Migrations.Framework
{
    [Migration(20211214160700)]
    public class M20211214160700 : AutoReversingMigration
    {
        public override void Up()
        {
            Alter.Table("Frwk_EntityConfigs").AddColumn("SourceLkp").AsInt64().Nullable();
            Alter.Table("Frwk_EntityProperties").AddColumn("SourceLkp").AsInt64().Nullable();
        }
    }
}
