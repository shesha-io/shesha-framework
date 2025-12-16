using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20251216202602)]
    public class M20251216202602 : OneWayMigration
    {
        public override void Up()
        {
            Execute.Sql("update frwk.entity_properties set data_format = 'generic-entity' where data_type = 'entity' and entity_type is null");
        }
    }
}
