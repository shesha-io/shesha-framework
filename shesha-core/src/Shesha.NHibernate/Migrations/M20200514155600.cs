using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20200514155600)]
    public class M20200514155600: AutoReversingMigration
    {
        public override void Up()
        {
            Alter.Table("Core_ImportResults").AddDiscriminator();
        }
    }
}
