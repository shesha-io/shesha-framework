using System;
using FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20200702144300)]
    public class M20200702144300: Migration
    {
        public override void Up()
        {
            Execute.Sql(
@"with duplicatedLists as (
	select 
		Id,
		Namespace,
		Name 
	from 
		Frwk_ReferenceLists list
	where
		exists (
			select 
				1 
			from 
				Frwk_ReferenceLists newList
			where
				newList.Namespace = list.Namespace
				and newList.Name = list.Name
				and coalesce(newList.TenantId, -1) = coalesce(list.TenantId, -1)
				and newList.Id <> list.Id
				and newList.CreationTime > list.CreationTime
		)
)
delete from 
	Frwk_ReferenceListItems 
where 
	ReferenceListId in (select Id from duplicatedLists)");

            Execute.Sql(
@"delete from 
	Frwk_ReferenceLists 
where 
	exists (
			select 
				1 
			from 
				Frwk_ReferenceLists newList
			where
				newList.Namespace = Frwk_ReferenceLists.Namespace
				and newList.Name = Frwk_ReferenceLists.Name
				and coalesce(newList.TenantId, -1) = coalesce(Frwk_ReferenceLists.TenantId, -1)
				and newList.Id <> Frwk_ReferenceLists.Id
				and newList.CreationTime > Frwk_ReferenceLists.CreationTime
		)");

			// delete old index and create new unique index
			if (Schema.Table("Frwk_ReferenceLists").Index("idx_Frwk_ReferenceLists_Name").Exists())
                Delete.Index("idx_Frwk_ReferenceLists_Name").OnTable("Frwk_ReferenceLists");

			Execute.Sql("CREATE UNIQUE INDEX IX_Frwk_ReferenceLists_Namespace_Name_Tenant ON Frwk_ReferenceLists (Namespace, Name, TenantId)");
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
