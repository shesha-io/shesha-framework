using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20240712203400)]
    public class M20240712203400 : OneWayMigration
    {
        public override void Up()
        {
            // only for MS SQL becausemigration added before release and needed only for test DBs
            IfDatabase("SqlServer").Execute.Sql(@"
update Frwk_PermissionedObjects set
Object = REPLACE(Object, '@', '#'),
Parent = null
where type = 'Shesha.Form'
            ");
        }
    }
}
