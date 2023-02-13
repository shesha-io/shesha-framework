using System;
using FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20200305100000)]
    public class M20200305100000: Migration
    {
        public override void Up()
        {
            Execute.Sql(
@"create view vw_Core_AreasTreeItem
as
select 
	Id,
	ParentAreaId as ParentId,
	Name,
	TenantId,
	cast((coalesce((select top 1 1 from Core_Areas childA where childA.ParentAreaId = a.Id and childA.IsDeleted = 0), 0)) as bit) as HasChilds 
from 
	Core_Areas a
where 
	IsDeleted = 0");
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
