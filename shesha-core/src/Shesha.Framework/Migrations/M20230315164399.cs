using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20230315164399), MsSqlOnly]
    public class M20230315164399 : OneWayMigration
    {
        public override void Up()
        {
            Execute.Sql(@"drop index Frwk_ConfigurationItems.uq_Frwk_ConfigurationItems_LiveVersion");
            Execute.Sql(@"create unique index uq_Frwk_ConfigurationItems_LiveVersion on Frwk_ConfigurationItems(Name, ModuleId, ApplicationId, ItemType, TenantId) where IsDeleted=0 and VersionStatusLkp = 3");

            Execute.Sql(@"drop index Frwk_ConfigurationItems.uq_Frwk_ConfigurationItems_Versioning");
            Execute.Sql(@"create unique index 
	uq_Frwk_ConfigurationItems_Versioning 
on 
	Frwk_ConfigurationItems(Name, ModuleId, ApplicationId, ItemType, TenantId, VersionNo)
where 
	IsDeleted = 0");

            Execute.Sql(@"DROP TRIGGER trg_Frwk_ConfigurationItems_UpdateIsLast_AD");
            Execute.Sql(@"CREATE TRIGGER trg_Frwk_ConfigurationItems_UpdateIsLast_AD
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
			inner join deleted on (deleted.ModuleId = item.ModuleId or deleted.ModuleId is null and item.ModuleId is null)
					and deleted.Name = item.Name
					and deleted.ItemType = item.ItemType
					and (deleted.TenantId = item.TenantId or deleted.TenantId is null and item.TenantId is null)
		where
			item.IsLast = 0
			and not exists (
				select 
					1 
				from
					Frwk_ConfigurationItems ci
				where
					ci.IsDeleted = 0
					and (ci.ModuleId = item.ModuleId or ci.ModuleId is null and item.ModuleId is null)
					and ci.Name = item.Name
					and ci.ItemType = item.ItemType
					and (ci.TenantId = item.TenantId or ci.TenantId is null and item.TenantId is null)
					and ci.VersionNo > item.VersionNo
			)
	end
END");

            Execute.Sql(@"DROP TRIGGER trg_Frwk_ConfigurationItems_UpdateIsLast_AI");
            Execute.Sql(@"CREATE TRIGGER trg_Frwk_ConfigurationItems_UpdateIsLast_AI
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
		inner join inserted on (inserted.ModuleId = item.ModuleId or inserted.ModuleId is null and item.ModuleId is null)
				and inserted.Name = item.Name
				and inserted.ItemType = item.ItemType
				and (inserted.ApplicationId = item.ApplicationId or inserted.ApplicationId is null and item.ApplicationId is null)
				and (inserted.TenantId = item.TenantId or inserted.TenantId is null and item.TenantId is null)
	where
		item.IsLast = 1
		and exists (
			select 
				1 
			from
				Frwk_ConfigurationItems ci
			where
				ci.IsDeleted = 0
				and (ci.ModuleId = item.ModuleId or ci.ModuleId is null and item.ModuleId is null)
				and ci.Name = item.Name
				and ci.ItemType = item.ItemType
				and (ci.ApplicationId = item.ApplicationId or ci.ApplicationId is null and item.ApplicationId is null)
				and (ci.TenantId = item.TenantId or ci.TenantId is null and item.TenantId is null)
				and ci.VersionNo > item.VersionNo
		)
	update 
		Frwk_ConfigurationItems 
	set 
		IsLast = 1 
	from
		Frwk_ConfigurationItems item
		inner join inserted on (inserted.ModuleId = item.ModuleId or inserted.ModuleId is null and item.ModuleId is null)
				and inserted.Name = item.Name
				and inserted.ItemType = item.ItemType
				and (inserted.ApplicationId = item.ApplicationId or inserted.ApplicationId is null and item.ApplicationId is null)
				and (inserted.TenantId = item.TenantId or inserted.TenantId is null and item.TenantId is null)
	where
		item.IsLast = 0
		and not exists (
			select 
				1 
			from
				Frwk_ConfigurationItems ci
			where
				ci.IsDeleted = 0
				and (ci.ModuleId = item.ModuleId or ci.ModuleId is null and item.ModuleId is null)
				and ci.Name = item.Name
				and ci.ItemType = item.ItemType
				and (ci.ApplicationId = item.ApplicationId or ci.ApplicationId is null and item.ApplicationId is null)
				and (ci.TenantId = item.TenantId or ci.TenantId is null and item.TenantId is null)
				and ci.VersionNo > item.VersionNo
		)
END");

            Execute.Sql(@"DROP TRIGGER trg_Frwk_ConfigurationItems_UpdateIsLast_AU");
            Execute.Sql(@"CREATE TRIGGER trg_Frwk_ConfigurationItems_UpdateIsLast_AU
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
			inner join inserted on (inserted.ModuleId = item.ModuleId or inserted.ModuleId is null and item.ModuleId is null)
					and inserted.Name = item.Name
					and inserted.ItemType = item.ItemType
					and (inserted.ApplicationId = item.ApplicationId or inserted.ApplicationId is null and item.ApplicationId is null)
					and (inserted.TenantId = item.TenantId or inserted.TenantId is null and item.TenantId is null)
		where
			item.IsLast = 1
			and exists (
				select 
					1 
				from
					Frwk_ConfigurationItems ci
				where
					ci.IsDeleted = 0
					and (ci.ModuleId = item.ModuleId or ci.ModuleId is null and item.ModuleId is null)
					and ci.Name = item.Name
					and ci.ItemType = item.ItemType
					and (ci.ApplicationId = item.ApplicationId or ci.ApplicationId is null and item.ApplicationId is null)
					and (ci.TenantId = item.TenantId or ci.TenantId is null and item.TenantId is null)
					and ci.VersionNo > item.VersionNo
			)

		update 
			Frwk_ConfigurationItems 
		set 
			IsLast = 1 
		from
			Frwk_ConfigurationItems item
			inner join inserted on (inserted.ModuleId = item.ModuleId or inserted.ModuleId is null and item.ModuleId is null)
					and inserted.Name = item.Name
					and inserted.ItemType = item.ItemType
					and (inserted.ApplicationId = item.ApplicationId or inserted.ApplicationId is null and item.ApplicationId is null)
					and (inserted.TenantId = item.TenantId or inserted.TenantId is null and item.TenantId is null)
		where
			item.IsLast = 0
			and not exists (
				select 
					1 
				from
					Frwk_ConfigurationItems ci
				where
					ci.IsDeleted = 0
					and (ci.ModuleId = item.ModuleId or ci.ModuleId is null and item.ModuleId is null)
					and ci.Name = item.Name
					and ci.ItemType = item.ItemType
					and (ci.ApplicationId = item.ApplicationId or ci.ApplicationId is null and item.ApplicationId is null)
					and (ci.TenantId = item.TenantId or ci.TenantId is null and item.TenantId is null)
					and ci.VersionNo > item.VersionNo
			)
	end
END");

			Execute.Sql(@"DROP TRIGGER trg_Frwk_StoredFileVersions_UpdateIsLast_AI");
			Execute.Sql(@"CREATE TRIGGER trg_Frwk_StoredFileVersions_UpdateIsLast_AI
   ON  Frwk_StoredFileVersions
   AFTER INSERT
AS 
BEGIN
	SET NOCOUNT ON;
	
	update 
		Frwk_StoredFileVersions 
	set 
		IsLast = 0 
	from
		Frwk_StoredFileVersions ver
		inner join inserted on inserted.FileId = ver.FileId
	where
		ver.IsLast = 1
		and exists (
			select 
				1 
			from
				Frwk_StoredFileVersions newerVer
			where
				newerVer.FileId = ver.FileId
				and newerVer.CreationTime > ver.CreationTime
		)

	update 
		Frwk_StoredFileVersions 
	set 
		IsLast = 1 
	from
		Frwk_StoredFileVersions ver
		inner join inserted on inserted.FileId = ver.FileId
	where
		ver.IsLast = 0
		and not exists (
			select 
				1 
			from
				Frwk_StoredFileVersions newerVer
			where
				newerVer.FileId = ver.FileId
				and newerVer.CreationTime > ver.CreationTime
		)
END");

			Execute.Sql(@"DROP TRIGGER trg_Frwk_StoredFileVersions_UpdateIsLast_AU");
			Execute.Sql(@"CREATE TRIGGER trg_Frwk_StoredFileVersions_UpdateIsLast_AU
   ON  Frwk_StoredFileVersions
   AFTER update
AS 
BEGIN
	SET NOCOUNT ON;
	
	IF UPDATE (CreationTime)
    begin
		update 
			Frwk_StoredFileVersions 
		set 
			IsLast = 0 
		from
			Frwk_StoredFileVersions ver
			inner join inserted on inserted.FileId = ver.FileId
		where
			ver.IsLast = 1
			and exists (
				select 
					1 
				from
					Frwk_StoredFileVersions newerVer
				where
					newerVer.FileId = ver.FileId
					and newerVer.CreationTime > ver.CreationTime
			)

		update 
			Frwk_StoredFileVersions 
		set 
			IsLast = 1 
		from
			Frwk_StoredFileVersions ver
			inner join inserted on inserted.FileId = ver.FileId
		where
			ver.IsLast = 0
			and not exists (
				select 
					1 
				from
					Frwk_StoredFileVersions newerVer
				where
					newerVer.FileId = ver.FileId
					and newerVer.CreationTime > ver.CreationTime
			)
	end
END");

			Execute.Sql(@"DROP TRIGGER trg_Frwk_StoredFileVersions_UpdateIsLast_AD");
			Execute.Sql(@"CREATE TRIGGER trg_Frwk_StoredFileVersions_UpdateIsLast_AD
   ON  Frwk_StoredFileVersions
   AFTER DELETE
AS 
BEGIN
	SET NOCOUNT ON;
	
	if exists (select 1 from deleted where IsLast = 1)
	begin
		update 
			Frwk_StoredFileVersions 
		set 
			IsLast = 1 
		from
			Frwk_StoredFileVersions ver
			inner join deleted on deleted.FileId = ver.FileId
		where
			ver.IsLast = 0
			and not exists (
				select 
					1 
				from
					Frwk_StoredFileVersions newerVer
				where
					newerVer.FileId = ver.FileId
					and newerVer.CreationTime > ver.CreationTime
			)
	end
END");

			Execute.Sql(@"DROP TRIGGER trg_Frwk_VersionedFieldVersions_UpdateIsLast_AD");
			Execute.Sql(@"CREATE TRIGGER trg_Frwk_VersionedFieldVersions_UpdateIsLast_AD
   ON  Frwk_VersionedFieldVersions
   AFTER DELETE
AS 
BEGIN
	SET NOCOUNT ON;
	
	if exists (select 1 from deleted where IsLast = 1)
	begin
		update 
			Frwk_VersionedFieldVersions 
		set 
			IsLast = 1 
		from
			Frwk_VersionedFieldVersions ver
			inner join deleted on deleted.FieldId = ver.FieldId
		where
			ver.IsLast = 0
			and not exists (
				select 
					1 
				from
					Frwk_VersionedFieldVersions newerVer
				where
					newerVer.FieldId = ver.FieldId
					and newerVer.CreationTime > ver.CreationTime
			)
	end
END");

			Execute.Sql(@"DROP TRIGGER trg_Frwk_VersionedFieldVersions_UpdateIsLast_AI");
			Execute.Sql(@"CREATE TRIGGER trg_Frwk_VersionedFieldVersions_UpdateIsLast_AI
   ON  Frwk_VersionedFieldVersions
   AFTER INSERT
AS 
BEGIN
	SET NOCOUNT ON;
	
	update 
		Frwk_VersionedFieldVersions 
	set 
		IsLast = 0 
	from
		Frwk_VersionedFieldVersions ver
		inner join inserted on inserted.FieldId = ver.FieldId
	where
		ver.IsLast = 1
		and exists (
			select 
				1 
			from
				Frwk_VersionedFieldVersions newerVer
			where
				newerVer.FieldId = ver.FieldId
				and newerVer.CreationTime > ver.CreationTime
		)

	update 
		Frwk_VersionedFieldVersions 
	set 
		IsLast = 1 
	from
		Frwk_VersionedFieldVersions ver
		inner join inserted on inserted.FieldId = ver.FieldId
	where
		ver.IsLast = 0
		and not exists (
			select 
				1 
			from
				Frwk_VersionedFieldVersions newerVer
			where
				newerVer.FieldId = ver.FieldId
				and newerVer.CreationTime > ver.CreationTime
		)
END");

			Execute.Sql(@"DROP TRIGGER trg_Frwk_VersionedFieldVersions_UpdateIsLast_AU");
			Execute.Sql(@"CREATE TRIGGER trg_Frwk_VersionedFieldVersions_UpdateIsLast_AU
   ON  Frwk_VersionedFieldVersions
   AFTER update
AS 
BEGIN
	SET NOCOUNT ON;
	
	IF UPDATE (CreationTime) or UPDATE(IsDeleted)
    begin
		update 
			Frwk_VersionedFieldVersions 
		set 
			IsLast = 0 
		from
			Frwk_VersionedFieldVersions ver
			inner join inserted on inserted.FieldId = ver.FieldId
		where
			ver.IsLast = 1
			and exists (
				select 
					1 
				from
					Frwk_VersionedFieldVersions newerVer
				where
					newerVer.FieldId = ver.FieldId
					and newerVer.CreationTime > ver.CreationTime
			)

		update 
			Frwk_VersionedFieldVersions 
		set 
			IsLast = 1 
		from
			Frwk_VersionedFieldVersions ver
			inner join inserted on inserted.FieldId = ver.FieldId
		where
			ver.IsLast = 0
			and not exists (
				select 
					1 
				from
					Frwk_VersionedFieldVersions newerVer
				where
					newerVer.FieldId = ver.FieldId
					and newerVer.CreationTime > ver.CreationTime
			)
	end
END");
        }
    }
}
