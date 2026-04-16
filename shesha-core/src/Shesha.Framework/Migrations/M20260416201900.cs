using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20260416201900)]
    public class M20260416201900 : OneWayMigration
    {
        public override void Up()
        {
            // fill required data (AbpUser.NormalizedEmailAddress has [Required] attribute)
            Execute.Sql("update \"AbpUsers\" set \"EmailAddress\" = '', \"NormalizedEmailAddress\" = ' ' where \"EmailAddress\" is null");
        }
    }
}
