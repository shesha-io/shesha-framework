using System;
using FluentMigrator;

namespace Shesha.NHibernate.Migrations
{
    [Migration(20200908100200)]
    public class M20200908100200: Migration
    {
        public override void Up()
        {
            Execute.Sql(
@"create view vw_Core_ReferenceListItemValues as 
select
	list.Namespace,
	list.Name,
	item.Item,
	item.ItemValue
from
	Frwk_ReferenceLists list
	inner join Frwk_ReferenceListItems item on item.ReferenceListId = list.Id and item.IsDeleted = 0
where
	list.IsDeleted = 0
");
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
