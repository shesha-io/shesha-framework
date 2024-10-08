using FluentMigrator;
using NUglify;
using Shesha.FluentMigrator;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Migrations
{
    [Migration(20240725180100)]
    public class M20240725180100 : Migration
    {
        public override void Up()
        {
            Alter.Table("Core_Sites")
                .AddColumn("OperatingHoursStartTime").AsDateTime().Nullable()
                .AddColumn("OperatingHoursClosingTime").AsDateTime().Nullable();
        }
        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
