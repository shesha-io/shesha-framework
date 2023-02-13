using System;
using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20200529172900)]
    public class M20200529172900: Migration
    {
        public override void Up()
        {
            Rename.Column("TypeLkp").OnTable("Frwk_Notes").To("CategoryLkp");
            Delete.Column("SubTypeLkp").FromTable("Frwk_Notes");
            Rename.Column("ImportanceLkp").OnTable("Frwk_Notes").To("PriorityLkp");
            Alter.Table("Frwk_Notes").AddForeignKeyColumn("AuthorId", "Core_Persons");
            Rename.Table("Frwk_Notes").To("Core_Notes");
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
