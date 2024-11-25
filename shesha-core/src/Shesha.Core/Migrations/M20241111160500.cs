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
    [Migration(20241111160500)]
    public class M20241111160500 : Migration
    {
        public override void Up()
        {
            Alter.Table("Core_OmoNotificationMessages")
                   .AddColumn("StatusLkp").AsInt64().Nullable();
        }
        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
