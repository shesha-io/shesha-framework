using FluentMigrator;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shesha.Migrations.Framework
{
    [Migration(20211217095800)]
    public class M20211217095800 : AutoReversingMigration
    {
        public override void Up()
        {
            Alter.Table("Frwk_EntityProperties").AlterColumn("DataType").AsString(100).Nullable();
            Alter.Table("Frwk_EntityProperties").AlterColumn("EntityType").AsString(300).Nullable();
            Alter.Table("Frwk_EntityProperties").AlterColumn("Label").AsString(300).Nullable();
            Alter.Table("Frwk_EntityProperties").AlterColumn("Name").AsString(100).Nullable();
            Alter.Table("Frwk_EntityProperties").AlterColumn("ReferenceListName").AsString(100).Nullable();
            Alter.Table("Frwk_EntityProperties").AlterColumn("ReferenceListNamespace").AsString(300).Nullable();

            Alter.Table("Frwk_EntityProperties").AddColumn("DataFormat").AsString(100).Nullable();
        }
    }
}
