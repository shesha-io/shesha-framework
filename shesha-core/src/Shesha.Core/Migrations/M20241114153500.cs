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
    [Migration(20241114153500)]
    public class M20241114153500 : Migration
    {
        public override void Up()
        {
            Alter.Table("Core_OmoNotifications")
                .AddForeignKeyColumn("NotificationTopicId", "Core_NotificationTopics");
        }
        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
