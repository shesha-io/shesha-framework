using FluentMigrator;
using Shesha.FluentMigrator;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Migrations
{
    [Migration(20250527111600)]
    public class M20250527111600 : Migration
    {
        public override void Up()
        {
            Alter.Table("Core_Notes").AddColumn("UniqueIdentifier").AsString(50).NotNullable().SetExistingRowsTo("").WithDefaultValue("");
        }
        public override void Down()
        {
        }
    }
}
