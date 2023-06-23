using FluentMigrator;
using Shesha.FluentMigrator;
using System;

namespace Shesha.Migrations.Framework
{
    [Migration(20220908093699), MsSqlOnly]
    public class M20220908093699 : OneWayMigration
    {
        public override void Up()
        {
            Create.Column("IsLast").OnTable("Frwk_VersionedFieldVersions").AsBoolean().NotNullable().SetExistingRowsTo(1);

			Execute.Sql(
@"CREATE TRIGGER trg_Frwk_VersionedFieldVersions_UpdateIsLast_AD
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
			Frwk_VersionedFieldVersions log
		where
			(log.IsLast = 0 or log.IsLast is null)
			and log.FieldId in (select distinct(FieldId) from deleted)
			and log.id = (
				select top 1
					id
				from
					Frwk_VersionedFieldVersions log2
				where
					(log2.IsDeleted = 0 or log2.IsDeleted is null)
					and log2.FieldId = log.FieldId
				order by log2.CreationTime desc
			)

	end
END");

			Execute.Sql(
@"CREATE TRIGGER trg_Frwk_VersionedFieldVersions_UpdateIsLast_AI
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
		Frwk_VersionedFieldVersions log
	where
		(log.IsLast = 1 or log.IsLast is null)
		and log.FieldId in (select distinct(FieldId) from inserted)
		and log.id <> (
			select top 1
				id
			from
				Frwk_VersionedFieldVersions log2
			where
				(log2.IsDeleted = 0 or log2.IsDeleted is null)
				and log2.FieldId = log.FieldId
			order by log2.CreationTime desc
		)

	update 
		Frwk_VersionedFieldVersions 
	set 
		IsLast = 1 
	from
		Frwk_VersionedFieldVersions log
	where
		(log.IsLast = 0 or log.IsLast is null)
		and log.FieldId in (select distinct(FieldId) from inserted)
		and log.id = (
			select top 1
				id
			from
				Frwk_VersionedFieldVersions log2
			where
				(log2.IsDeleted = 0 or log2.IsDeleted is null)
				and log2.FieldId = log.FieldId
			order by log2.CreationTime desc
		)
END");

			Execute.Sql(
@"CREATE TRIGGER trg_Frwk_VersionedFieldVersions_UpdateIsLast_AU
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
			Frwk_VersionedFieldVersions log
		where
			(log.IsLast = 1 or log.IsLast is null)
			and log.FieldId in (select distinct(FieldId) from inserted)
			and log.id <> (
				select top 1
					id
				from
					Frwk_VersionedFieldVersions log2
				where
					(log2.IsDeleted = 0 or log2.IsDeleted is null)
					and log2.FieldId = log.FieldId
				order by log2.CreationTime desc
			)

		update 
			Frwk_VersionedFieldVersions 
		set 
			IsLast = 1 
		from
			Frwk_VersionedFieldVersions log
		where
			(log.IsLast = 0 or log.IsLast is null)
			and log.FieldId in (select distinct(FieldId) from inserted)
			and log.id = (
				select top 1
					id
				from
					Frwk_VersionedFieldVersions log2
				where
					(log2.IsDeleted = 0 or log2.IsDeleted is null)
					and log2.FieldId = log.FieldId
				order by log2.CreationTime desc
			)
	end
END");

			Execute.Sql(
@"with data as (
	select
		v.Id,
		(ROW_NUMBER() over (partition by v.FieldId order by v.CreationTime desc)) as RowNo
	from
		Frwk_VersionedFieldVersions v
)
update
	ver
set
	IsLast = (case when data.RowNo = 1 then 1 else 0 end)
from
	Frwk_VersionedFieldVersions ver
	inner join data on data.Id = ver.Id");
		}
	}
}
