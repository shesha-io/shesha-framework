using System;
using FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20200622185300)]
    public class M20200622185300: Migration
    {
        public override void Up()
        {
            Execute.Sql("CREATE NONCLUSTERED INDEX IX_Core_Persons_MobileNumber1 ON Core_Persons(MobileNumber1)");
            Execute.Sql("CREATE NONCLUSTERED INDEX IX_Core_Persons_EmailAddress1 ON Core_Persons(EmailAddress1)");
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
