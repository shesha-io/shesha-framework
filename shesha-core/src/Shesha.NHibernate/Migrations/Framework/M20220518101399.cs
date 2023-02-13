using FluentMigrator;
using System;

namespace Shesha.Migrations.Framework
{
    [Migration(20220518101399)]
    public class M20220518101399 : Migration
    {
        public override void Down()
        {
            throw new NotImplementedException();
        }

        public override void Up()
        {
            Execute.Sql(
@"create view vw_Frwk_FlatReferenceListItems
as
select 
	item.Id,
	coalesce(list.Namespace, '') + '.' + list.Name as ReferenceListFullName,
	item.Item,
	item.ItemValue,
	item.TenantId
from
	Frwk_ReferenceLists list
	inner join Frwk_ReferenceListItems item on item.ReferenceListId = list.Id
where
	list.IsDeleted = 0
	and item.IsDeleted = 0
");
        }
    }
}
