using FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20200129234000)]
    public class M20200129234000 : Migration
    {
        public override void Up()
        {
            Delete.Column("FullName").FromTable("Core_Persons");
            Delete.Column("FullName2").FromTable("Core_Persons");

            Execute.Sql("alter table Core_Persons add FullName as (coalesce(Firstname + ' ', '') + coalesce(Lastname, '')) PERSISTED");
            Execute.Sql("alter table Core_Persons add FullName2 as (coalesce(Lastname + ' ', '') + coalesce(Firstname, '')) PERSISTED");
        }

        public override void Down()
        {
            throw new System.NotImplementedException();
        }
    }
}
