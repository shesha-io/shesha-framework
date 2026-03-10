using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20260208231503)]
    public class M20260208231503 : OneWayMigration
    {
        public override void Up()
        {
            this.ForceBootstrapper("EntityConfigsBootstrapper");
        }
    }
}
