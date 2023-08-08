using FluentMigrator;
using System;

namespace Shesha.Migrations
{
    [Migration(20230724152500)]
    public class M20230724152500 : Migration
    {
        public override void Up()
        {
            Alter.Table("Core_NotificationMessages").AddColumn("SourceEntityId").AsString(100).Nullable();
            Alter.Table("Core_NotificationMessages").AddColumn("SourceEntityClassName").AsString(1000).Nullable();
            Alter.Table("Core_NotificationMessages").AddColumn("SourceEntityDisplayName").AsString(1000).Nullable();
        }
        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}