using FluentMigrator;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Migrations
{
    [Migration(20230302160800)]
    public class M20230302160800 : Migration
    {
        public override void Up()
        {
            Delete.Column("PriorityLkp").FromTable("Core_Notes");
            Alter.Table("Core_Notes").AddColumn("VisibilityTypeLkp").AsInt64().Nullable();
            Alter.Table("Core_Notes").AddColumn("HasAttachment").AsBoolean();
        }
        public override void Down()
        {
        }
    }
}