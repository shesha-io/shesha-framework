using System;
using FluentMigrator;

namespace Shesha.Migrations.Abp
{
    [Migration(20200707000400)]
    public class M20200707000400: Migration
    {
        public override void Up()
        {
            Alter.Column("EmailAddress").OnTable("AbpUsers").AsString(256).Nullable();
            Alter.Column("NormalizedEmailAddress").OnTable("AbpUsers").AsString(256).Nullable();
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
