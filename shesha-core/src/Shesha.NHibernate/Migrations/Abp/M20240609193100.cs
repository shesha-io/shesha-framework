using FluentMigrator;
using System;

namespace Shesha.Migrations.Abp
{
    [Migration(20240609193100)]
    public class M20240609193100 : Migration
    {
        public override void Up()
        {
            Alter.Table("AbpUsers")
                .AddColumn("IsAnonymous").AsBoolean().Nullable();
        }
        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}