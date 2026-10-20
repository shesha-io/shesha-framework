using FluentMigrator;
using Shesha.FluentMigrator;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    /// <summary>
    /// Tables for the CRUD opt-in test entities (#5568)
    /// </summary>
    [Migration(20261020120000)]
    public class M20261020120000 : OneWayMigration
    {
        public override void Up()
        {
            Create.Table("SheshaFunctionalTests_CrudExposedEntities")
                .WithIdAsGuid()
                .WithColumn("Name").AsString(300).Nullable();

            Create.Table("SheshaFunctionalTests_CrudUnexposedEntities")
                .WithIdAsGuid()
                .WithColumn("Name").AsString(300).Nullable();
        }
    }
}
