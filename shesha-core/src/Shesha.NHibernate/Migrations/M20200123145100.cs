using System;
using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20200123145100)]
    public class M20200123145100 : Migration
    {
        public override void Up()
        {
            Alter.Table("Core_Persons")
                .AddForeignKeyColumnInt64("UserId", "AbpUsers");

            Execute.Sql(
@"update 
	Core_Persons
set
	UserId = (select Id from AbpUsers where Username = Core_Persons.Username and coalesce(TenantId, -1) = coalesce(Core_Persons.TenantId, -1))
where
	UserId is null");
        }

        public override void Down()
        {
            // todo: implement DeleteForeignKeyColumn
            throw new NotImplementedException();
        }
    }
}
