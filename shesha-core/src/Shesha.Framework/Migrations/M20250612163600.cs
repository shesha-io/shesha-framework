using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20250612163600)]
    public class M20250612163600 : OneWayMigration
    {
        public override void Up()
        {
            Insert.ForceBootstrapper("EntityConfigsBootstrapper");
        }
    }
}