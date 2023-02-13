using System;
using FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20210305110100)]
    public class M20210305110100: Migration
    {
        public override void Up()
        {
            Execute.Sql(
@"create view vw_Core_CheckListTreeItems
as
select 
	Id,
	ParentId,
	Name,
	TenantId,
	OrderIndex,
	cast((coalesce((select top 1 1 from Core_CheckListItems childT where childT.ParentId = t.Id and childT.IsDeleted = 0), 0)) as bit) as HasChilds 
from 
	Core_CheckListItems t
where 
	IsDeleted = 0");
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
