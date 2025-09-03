using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20250903110800), MsSqlOnly]
    public class M20250903110800 : OneWayMigration
    {
        public override void Up()
        {
            // Create Structured List Table
            Create.Table("Frwk_StructuredLists")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithTenantIdAsNullable()
                .WithColumn("Category").AsString(300).Nullable()
                .WithColumn("Frwk_OwnerId").AsString(40).Nullable()
                .WithColumn("Frwk_OwnerType").AsString(100).Nullable();

            // Create Structured List Version Table
            Create.Table("Frwk_StructuredListVersions")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithForeignKeyColumn("StructuredListId", "Frwk_StructuredLists")
                .WithColumn("IsLast").AsBoolean().WithDefaultValue(false).NotNullable()
                .WithColumn("Heading").AsString().Nullable();

            // Create Structured List Item Table
            Create.Table("Frwk_StructuredListItems")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithForeignKeyColumn("StructuredListVersionId", "Frwk_StructuredListVersions")
                .WithForeignKeyColumn("PreviousVersionItemId", "Frwk_StructuredListItems")
                .WithColumn("ItemText").AsStringMax().NotNullable()
                .WithColumn("ItemChecked").AsBoolean().WithDefaultValue(false).NotNullable()
                .WithColumn("IsMandatory").AsBoolean().Nullable()
                .WithColumn("SortOrder").AsInt64().NotNullable();

            Execute.Sql(@"CREATE TRIGGER trg_Frwk_StructuredListVersions_UpdateIsLast_AD
   ON  Frwk_StructuredListVersions
   AFTER DELETE
AS 
BEGIN
	SET NOCOUNT ON;
	
	if exists (select 1 from deleted where IsLast = 1)
	begin
		update 
			Frwk_StructuredListVersions 
		set 
			IsLast = 1 
		from
			Frwk_StructuredListVersions log
		where
			(log.IsLast = 0 or log.IsLast is null)
			and log.StructuredListId in (select distinct(StructuredListId) from deleted)
			and log.id = (
				select top 1
					id
				from
					Frwk_StructuredListVersions log2
				where
					(log2.IsDeleted = 0 or log2.IsDeleted is null)
					and log2.StructuredListId = log.StructuredListId
				order by log2.CreationTime desc
			)

	end
END");

            Execute.Sql(@"CREATE TRIGGER trg_Frwk_StructuredListVersions_UpdateIsLast_AI
   ON  Frwk_StructuredListVersions
   AFTER INSERT
AS 
BEGIN
	SET NOCOUNT ON;
	
	update 
		Frwk_StructuredListVersions 
	set 
		IsLast = 0 
	from
		Frwk_StructuredListVersions log
	where
		(log.IsLast = 1 or log.IsLast is null)
		and log.StructuredListId in (select distinct(StructuredListId) from inserted)
		and log.id <> (
			select top 1
				id
			from
				Frwk_StructuredListVersions log2
			where
				(log2.IsDeleted = 0 or log2.IsDeleted is null)
				and log2.StructuredListId = log.StructuredListId
			order by log2.CreationTime desc
		)

	update 
		Frwk_StructuredListVersions 
	set 
		IsLast = 1 
	from
		Frwk_StructuredListVersions log
	where
		(log.IsLast = 0 or log.IsLast is null)
		and log.StructuredListId in (select distinct(StructuredListId) from inserted)
		and log.id = (
			select top 1
				id
			from
				Frwk_StructuredListVersions log2
			where
				(log2.IsDeleted = 0 or log2.IsDeleted is null)
				and log2.StructuredListId = log.StructuredListId
			order by log2.CreationTime desc
		)
END");

            Execute.Sql(@"CREATE TRIGGER trg_Frwk_StructuredListVersions_UpdateIsLast_AU
   ON  Frwk_StructuredListVersions
   AFTER update
AS 
BEGIN
	SET NOCOUNT ON;
	
	IF UPDATE (CreationTime) or UPDATE(IsDeleted)
    begin
		update 
			Frwk_StructuredListVersions 
		set 
			IsLast = 0 
		from
			Frwk_StructuredListVersions log
		where
			(log.IsLast = 1 or log.IsLast is null)
			and log.StructuredListId in (select distinct(StructuredListId) from inserted)
			and log.id <> (
				select top 1
					id
				from
					Frwk_StructuredListVersions log2
				where
					(log2.IsDeleted = 0 or log2.IsDeleted is null)
					and log2.StructuredListId = log.StructuredListId
				order by log2.CreationTime desc
			)

		update 
			Frwk_StructuredListVersions 
		set 
			IsLast = 1 
		from
			Frwk_StructuredListVersions log
		where
			(log.IsLast = 0 or log.IsLast is null)
			and log.StructuredListId in (select distinct(StructuredListId) from inserted)
			and log.id = (
				select top 1
					id
				from
					Frwk_StructuredListVersions log2
				where
					(log2.IsDeleted = 0 or log2.IsDeleted is null)
					and log2.StructuredListId = log.StructuredListId
				order by log2.CreationTime desc
			)
	end
END");
        }
    }
}
