using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20240808161700)]
    public class M20240808161700 : OneWayMigration
    {
        public override void Up()
        {
            IfDatabase("SqlServer").Execute.Sql(@"
with po as (
select
po.id,
po.Object obj,
po.Name,
CHARINDEX(po.Object, '#') as chr,
SUBSTRING(po.Object, 0, CHARINDEX('#', po.Object, 0)) as Object,
po.CreationTime,
ROW_NUMBER() over (partition by SUBSTRING(po.Object, 0, CHARINDEX('#', po.Object, 0)) order by CreationTime desc) as rowNo
from Frwk_PermissionedObjects po
where po.Type = 'Shesha.Form'
)
update Frwk_PermissionedObjects set IsDeleted = 1
where id in (select id from po where po.rowNo > 1)
");

            IfDatabase("SqlServer").Execute.Sql(@"delete from Frwk_PermissionedObjects where Type = 'Shesha.Form' and (IsDeleted = 1 or AccessLkp = 2)");

            IfDatabase("SqlServer").Execute.Sql(@"
with po as (
select
po.id,
SUBSTRING(po.Object, 0, CHARINDEX('#', po.Object, 0)) as Object
from Frwk_PermissionedObjects po
where po.Type = 'Shesha.Form'
)
update pp set Object = (select po.Object from po where po.id = pp.id), Name = (select po.Object from po where po.id = pp.id)
from Frwk_PermissionedObjects pp
where pp.Type = 'Shesha.Form'
");
        }
    }
}
