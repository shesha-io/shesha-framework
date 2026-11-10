using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20261026145099)]
    public class M20261026145099 : OneWayMigration
    {
        public override void Up()
        {
            IfDatabase("SqlServer").Execute.Sql(@"UPDATE Core_NotificationTypeConfigs
SET Core_OverrideChannels =
    (
        SELECT '[' + STRING_AGG(JSON_QUERY(obj.value), ',') + ']'
        FROM OPENJSON(Core_OverrideChannels) AS obj
    )
WHERE Core_OverrideChannels IS NOT NULL
    AND Core_OverrideChannels != ''
    AND Core_OverrideChannels != '[]'
    AND ISJSON(Core_OverrideChannels) = 1;

UPDATE Core_NotificationTypeConfigs
SET Core_OverrideChannels = ''
WHERE Core_OverrideChannels IS NOT NULL
    AND Core_OverrideChannels != ''
    AND ISJSON(Core_OverrideChannels) = 0;");
        }
    }
}
