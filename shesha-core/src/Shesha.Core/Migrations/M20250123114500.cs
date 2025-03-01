using FluentMigrator;
using System;
//using Shesha.FluentMigrator;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Migrations
{
    [Migration(20250123114500)]
    public class M20250123114500: Migration
    {
        public override void Up()
        {
            //Delete Old Tables
            Delete.Table("Core_OldNotificationMessages");
            Delete.Table("Core_OldNotificationTemplates");
            Delete.Table("Core_OldNotifications");
        }

        public override void Down()
        {

        }

    }
}
