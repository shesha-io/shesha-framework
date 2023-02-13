using System;
using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.Abp
{
    [Migration(20220316193500)]
    public class M20220316193500 : Migration
    {
        public override void Up()
        {
            Create.Column("ExceptionMessage").OnTable("AbpAuditLogs").AsStringMax().Nullable();
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
