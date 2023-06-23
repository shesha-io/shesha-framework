using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.Framework
{
    [Migration(20220908092199), MsSqlOnly]
    public class M20220908092199 : OneWayMigration
    {

        public override void Up()
        {
            Create.Column("IsLast").OnTable("Frwk_StoredFileVersions").AsBoolean().NotNullable().SetExistingRowsTo(1);

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
		where
			(ver.IsLast = 0 or ver.IsLast is null)
			and ver.FileId in (select distinct(FileId) from deleted)
			and ver.id = (
				select top 1
					id
				from
					Frwk_StoredFileVersions ver2
				where
					ver2.FileId = ver.FileId
				order by ver2.CreationTime desc
			)

	end
END");

			Execute.Sql(
@"CREATE TRIGGER trg_Frwk_StoredFileVersions_UpdateIsLast_AI
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
	where
		(ver.IsLast = 1 or ver.IsLast is null)
		and ver.FileId in (select distinct(FileId) from inserted)
		and ver.id <> (
			select top 1
				id
			from
				Frwk_StoredFileVersions ver2
			where
				ver2.FileId = ver.FileId
			order by ver2.CreationTime desc
		)

	update 
		Frwk_StoredFileVersions 
	set 
		IsLast = 1 
	from
		Frwk_StoredFileVersions ver
	where
		(ver.IsLast = 0 or ver.IsLast is null)
		and ver.FileId in (select distinct(FileId) from inserted)
		and ver.id = (
			select top 1
				id
			from
				Frwk_StoredFileVersions ver2
			where
				ver2.FileId = ver.FileId
			order by ver2.CreationTime desc
		)
END");

			Execute.Sql(
@"CREATE TRIGGER trg_Frwk_StoredFileVersions_UpdateIsLast_AU
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
		where
			(ver.IsLast = 1 or ver.IsLast is null)
			and ver.FileId in (select distinct(FileId) from inserted)
			and ver.id <> (
				select top 1
					id
				from
					Frwk_StoredFileVersions ver2
				where
					ver2.FileId = ver.FileId
				order by ver2.CreationTime desc
			)

		update 
			Frwk_StoredFileVersions 
		set 
			IsLast = 1 
		from
			Frwk_StoredFileVersions ver
		where
			(ver.IsLast = 0 or ver.IsLast is null)
			and ver.FileId in (select distinct(FileId) from inserted)
			and ver.id = (
				select top 1
					id
				from
					Frwk_StoredFileVersions ver2
				where
					ver2.FileId = ver.FileId
				order by ver2.CreationTime desc
			)
	end
END");

			Execute.Sql(
@"with data as (
	select
		v.Id,
		(ROW_NUMBER() over (partition by v.FileId order by v.CreationTime desc)) as RowNo
	from
		Frwk_StoredFileVersions v
)
update
	ver
set
	IsLast = (case when data.RowNo = 1 then 1 else 0 end)
from
	Frwk_StoredFileVersions ver
	inner join data on data.Id = ver.Id");
		}
	}
}
