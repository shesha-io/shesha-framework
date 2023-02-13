using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20211208185400)]
    public class M20211208185400 : AutoReversingMigration
    {
        public override void Up()
        {
            // DynamicPerson
            Create.Table("Test_DynamicPersons")
                .WithIdAsGuid()
                .WithColumn("Age").AsInt32()
                .WithColumn("BirthDate").AsDateTime().Nullable()
                .WithColumn("FirstName").AsStringMax().Nullable()
                .WithColumn("LastName").AsStringMax().Nullable();


        }
    }
}
