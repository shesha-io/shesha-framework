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
    [Migration(20241114141100)]
    public class M20241114141100 : Migration
    {
        public override void Up()
        {
            Create.Table("Core_OmoNotificationMessageAttachments")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithColumn("FileName").AsString(300).Nullable()
                .WithForeignKeyColumn("PartOfId", "Core_NotificationMessages")
                .WithForeignKeyColumn("FileId", "Frwk_StoredFiles");
        }
        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
