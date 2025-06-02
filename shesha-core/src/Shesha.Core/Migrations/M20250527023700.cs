using FluentMigrator;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Migrations
{
    [Migration(20250527023700)]
    public class M20250527023700 : Migration
    {
        public override void Up()
        {
            Alter.Table("Core_Notes")
              .AlterColumn("CategoryLkp")
              .AsString(50)
              .Nullable();

            Rename.Column("CategoryLkp").OnTable("Core_Notes").To("Category");
        }
        public override void Down()
        {
        }
    }
}
