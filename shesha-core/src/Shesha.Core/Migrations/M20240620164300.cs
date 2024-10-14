using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20240620164300)]
    public class M20240620164300 : OneWayMigration
    {
        public override void Up()
        {
            this.Shesha().ReferenceListCreate("Shesha.Core", "PersonType");

            Alter.Table("Core_Persons").AddColumn("TypeLkp").AsInt64().Nullable();
        }
    }
}
