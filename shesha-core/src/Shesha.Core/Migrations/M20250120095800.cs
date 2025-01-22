using FluentMigrator;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Migrations
{
    [Migration(20250120095800)]
    public class M20250120095800: Migration
    {
        public override void Up()
        {
            Alter.Table("Core_NotificationChannelConfigs").AddColumn("Core_SupportsAttachment").AsBoolean().NotNullable().SetExistingRowsTo(false);
        }

        public override void Down()
        {
        }
    }
}
