using System;
using FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20210426093500)]
    public class M20210426093500: Migration
    {
        public override void Up()
        {
            Alter.Column("ItemValue").OnTable("Frwk_ReferenceListItems").AsInt64().NotNullable();
            Alter.Column("OrderIndex").OnTable("Frwk_ReferenceListItems").AsInt64().NotNullable();
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
