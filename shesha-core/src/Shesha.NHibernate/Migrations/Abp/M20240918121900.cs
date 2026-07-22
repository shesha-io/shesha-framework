using FluentMigrator;
using System;

namespace Shesha.Migrations.Abp
{
    [Migration(20240918121900)]
    public class M20240918121900 : Migration
    {
        public override void Up()
        {
            Alter.Table("AbpUsers").AddColumn("AllowedFrontEndApps").AsString(2048).Nullable();
        }
        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}