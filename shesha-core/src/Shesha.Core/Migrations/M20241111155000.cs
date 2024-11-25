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
    [Migration(20241111155000)]
    public class M20241111155000 : Migration
    {
        public override void Up()
        {
            Alter.Table("Core_NotificationTypeConfigs")
                   .AddColumn("Core_IsTimeSensitive").AsBoolean().WithDefaultValue(false);
        }
        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
