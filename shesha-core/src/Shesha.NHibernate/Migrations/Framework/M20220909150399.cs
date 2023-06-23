using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.Framework
{
    [Migration(20220909150399), MsSqlOnly]
    public class M20220909150399 : OneWayMigration
    {
        public override void Up()
        {
			Execute.Sql(
@"CREATE TRIGGER trg_Frwk_ConfigurationItems_UpdateIsLast_AD
   ON  Frwk_ConfigurationItems
   AFTER DELETE
AS 
BEGIN
	SET NOCOUNT ON;
	
	if exists (select 1 from deleted where IsLast = 1)
	begin
		update 
			Frwk_ConfigurationItems 
		set 
			IsLast = 1 
		from
			Frwk_ConfigurationItems item
			left join deleted on (deleted.ModuleId = item.ModuleId or deleted.ModuleId is null and item.ModuleId is null)
					and deleted.Name = item.Name
					and deleted.ItemType = item.ItemType
		where
			item.IsLast = 0
			and item.id = (
				select top 1
					id
				from
					Frwk_ConfigurationItems lastVersions
				where
					lastVersions.IsDeleted = 0
					and (lastVersions.ModuleId = item.ModuleId or lastVersions.ModuleId is null and item.ModuleId is null)
					and lastVersions.Name = item.Name
					and lastVersions.ItemType = item.ItemType
				order by lastVersions.VersionNo desc
			)
	end
END");

			Execute.Sql(
@"CREATE TRIGGER trg_Frwk_ConfigurationItems_UpdateIsLast_AI
   ON  Frwk_ConfigurationItems
   AFTER INSERT
AS 
BEGIN
	SET NOCOUNT ON;
	
	update 
		Frwk_ConfigurationItems 
	set 
		IsLast = 0 
	from
		Frwk_ConfigurationItems item
		left join inserted on (inserted.ModuleId = item.ModuleId or inserted.ModuleId is null and item.ModuleId is null)
				and inserted.Name = item.Name
				and inserted.ItemType = item.ItemType
	where
		item.IsLast = 1
		and item.id <> (
			select top 1
				id
			from
				Frwk_ConfigurationItems lastVersions
			where
				lastVersions.IsDeleted = 0
				and (lastVersions.ModuleId = item.ModuleId or lastVersions.ModuleId is null and item.ModuleId is null)
				and lastVersions.Name = item.Name
				and lastVersions.ItemType = item.ItemType
			order by lastVersions.VersionNo desc
		)

	update 
		Frwk_ConfigurationItems 
	set 
		IsLast = 1 
	from
		Frwk_ConfigurationItems item
		left join inserted on (inserted.ModuleId = item.ModuleId or inserted.ModuleId is null and item.ModuleId is null)
				and inserted.Name = item.Name
				and inserted.ItemType = item.ItemType
	where
		item.IsLast = 0
		and item.id = (
			select top 1
				id
			from
				Frwk_ConfigurationItems lastVersions
			where
				lastVersions.IsDeleted = 0
				and (lastVersions.ModuleId = item.ModuleId or lastVersions.ModuleId is null and item.ModuleId is null)
				and lastVersions.Name = item.Name
				and lastVersions.ItemType = item.ItemType
			order by lastVersions.VersionNo desc
		)
END");

			Execute.Sql(
@"CREATE TRIGGER trg_Frwk_ConfigurationItems_UpdateIsLast_AU
   ON  Frwk_ConfigurationItems
   AFTER update
AS 
BEGIN
	SET NOCOUNT ON;
	
	IF UPDATE (VersionNo) or UPDATE(IsDeleted)
    begin
		update 
			Frwk_ConfigurationItems 
		set 
			IsLast = 0 
		from
			Frwk_ConfigurationItems item
			left join inserted on (inserted.ModuleId = item.ModuleId or inserted.ModuleId is null and item.ModuleId is null)
					and inserted.Name = item.Name
					and inserted.ItemType = item.ItemType
		where
			item.IsLast = 1
			and item.id <> (
				select top 1
					id
				from
					Frwk_ConfigurationItems lastVersions
				where
					lastVersions.IsDeleted = 0
					and (lastVersions.ModuleId = item.ModuleId or lastVersions.ModuleId is null and item.ModuleId is null)
					and lastVersions.Name = item.Name
					and lastVersions.ItemType = item.ItemType
				order by lastVersions.VersionNo desc
			)

		update 
			Frwk_ConfigurationItems 
		set 
			IsLast = 1 
		from
			Frwk_ConfigurationItems item
			left join inserted on (inserted.ModuleId = item.ModuleId or inserted.ModuleId is null and item.ModuleId is null)
					and inserted.Name = item.Name
					and inserted.ItemType = item.ItemType
		where
			item.IsLast = 0
			and item.id = (
				select top 1
					id
				from
					Frwk_ConfigurationItems lastVersions
				where
					lastVersions.IsDeleted = 0
					and (lastVersions.ModuleId = item.ModuleId or lastVersions.ModuleId is null and item.ModuleId is null)
					and lastVersions.Name = item.Name
					and lastVersions.ItemType = item.ItemType
				order by lastVersions.VersionNo desc
			)
	end
END");

			Execute.Sql(
@"update 
	Frwk_ConfigurationItems 
set 
	IsLast = (
		case when exists (
			select 
				1
			from
				Frwk_ConfigurationItems prev
			where
				prev.IsDeleted = 0
				and (prev.ModuleId = Frwk_ConfigurationItems.ModuleId or prev.ModuleId is null and Frwk_ConfigurationItems.ModuleId is null)
				and prev.Name = Frwk_ConfigurationItems.Name
				and prev.ItemType = Frwk_ConfigurationItems.ItemType
				and prev.VersionNo > Frwk_ConfigurationItems.VersionNo
		) then 0 else 1 end
	)");
		}
	}
}
