using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20240801131999)]
    public class M20240801131999 : OneWayMigration
    {
        public override void Up()
        {
            IfDatabase("SqlServer").Execute.Sql(@"DROP TRIGGER [dbo].[trg_Frwk_StoredFileVersions_UpdateIsLast_AU]");
            IfDatabase("SqlServer").Execute.Sql(@"DROP TRIGGER [dbo].[trg_Frwk_StoredFileVersions_UpdateIsLast_AI]");

            IfDatabase("SqlServer").Execute.Sql(@"CREATE TRIGGER [dbo].[trg_Frwk_StoredFileVersions_UpdateIsLast_AIU]
   ON  [dbo].[Frwk_StoredFileVersions]
   AFTER INSERT, UPDATE
AS 
BEGIN
	SET NOCOUNT ON;

	IF UPDATE (CreationTime) or UPDATE(IsDeleted) or UPDATE (IsLast)
	begin
		update 
			ver
		set
			IsLast = (case when ver.IsLast = 1 then 0 else 1 end)
		from
			Frwk_StoredFileVersions ver WITH(NOLOCK)
			inner join (select distinct FileId from inserted) fileIds on fileIds.FileId = ver.FileId
		where
			ver.IsLast <> (case when exists (
				select 
					1 
				from 
					Frwk_StoredFileVersions nerwerVer WITH(NOLOCK)
				where
					nerwerVer.FileId = ver.FileId
					and nerwerVer.Id <> ver.Id
					and nerwerVer.IsDeleted = 0
					and nerwerVer.CreationTime > ver.CreationTime
			) then 0 else 1 end)
	end
END");

			IfDatabase("SqlServer").Execute.Sql(@"ALTER TRIGGER [dbo].[trg_Frwk_StoredFileVersions_UpdateIsLast_AD]
   ON  [dbo].[Frwk_StoredFileVersions]
   AFTER DELETE
AS 
BEGIN
	SET NOCOUNT ON;
	
	if exists (select 1 from deleted where IsLast = 1)
	begin
		update 
			ver
		set
			IsLast = (case when ver.IsLast = 1 then 0 else 1 end)
		from
			Frwk_StoredFileVersions ver WITH(NOLOCK)
			inner join (select distinct FileId from deleted) fileIds on fileIds.FileId = ver.FileId
		where
			ver.IsLast <> (case when exists (
				select 
					1 
				from 
					Frwk_StoredFileVersions nerwerVer WITH(NOLOCK)
				where
					nerwerVer.FileId = ver.FileId
					and nerwerVer.Id <> ver.Id
					and nerwerVer.IsDeleted = 0
					and nerwerVer.CreationTime > ver.CreationTime
			) then 0 else 1 end)
	end
END");
        }
    }
}
