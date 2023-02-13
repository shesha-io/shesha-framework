using System;
using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20200722141300)]
    public class M20200722141300 : Migration
    {
        public override void Up()
        {

            Execute.Sql(
@"
CREATE TYPE Core_EntityHistoryItem AS TABLE  
(
    /* Entity changes data */
    ChangeType tinyint, /* 0 - Created, 1 - Updated, 2 - Deleted*/
    EntityId nvarchar(48),
    EntityTypeFullName nvarchar(192), /* Fully qualified name of the entity type, including its namespace but not its assembly */
 
    /* Property changes data */
    PropertyName nvarchar(96),
    PropertyTypeFullName nvarchar(256), /* Fully qualified name of the property type, including its namespace but not its assembly */
    NewValue nvarchar(512),
    OldValue nvarchar(512),
 
    Description nvarchar(512) /* Optional */
)
");
            Execute.Sql(
@"
CREATE PROCEDURE [dbo].[Core_AddEntityHistoryEvents]
@changeTime datetime, 
@reason nvarchar(max),
@tenantId int,
@userId int,

@changes Core_EntityHistoryItem readonly
AS
BEGIN
	declare @count bigint;

	select @count = count(1) from @changes;

	print @count;

	if (@count > 0)
	begin
		select @changeTime = coalesce(@changeTime, Getdate());

		/* insert EntityChangeSet */
		insert into AbpEntityChangeSets (BrowserInfo, CreationTime, Reason, TenantId, UserId)
		values('Direct DB change', @changeTime, @reason, @tenantId, @userId)

		declare @ecsId int;
		Select @ecsId = SCOPE_IDENTITY();

		declare @entityChanges table
		(
			ChangeType tinyint,
			EntityId nvarchar(48),
			EntityTypeFullName nvarchar(192)
		)
		insert into @entityChanges select distinct ChangeType, EntityId, EntityTypeFullName from @changes;
	
		/* Insert EntityChanges */
		insert into AbpEntityChanges (ChangeTime, ChangeType, EntityChangeSetId, EntityId, EntityTypeFullName, TenantId)
		select @changeTime, coalesce(ChangeType, 1), @ecsId, EntityId, EntityTypeFullName, @tenantId from @entityChanges
	
		/* Insert EntityPropertyChanges */
		insert into AbpEntityPropertyChanges (EntityChangeId, NewValue, OriginalValue, PropertyName, PropertyTypeFullName, TenantId)
			select 
				(select id from AbpEntityChanges ec where ec.EntityChangeSetId = @ecsId and ec.ChangeType = coalesce(c.ChangeType, 1) and ec.EntityId = c.EntityId and ec.EntityTypeFullName = c.EntityTypeFullName),
				c.NewValue, c.OldValue, c.PropertyName, c.PropertyTypeFullName,
				@tenantId from @changes c
			where not ltrim(rtrim(coalesce(c.PropertyName, ''))) = '';

		/* Insert Descriptions for EntityPropertyChanges */
		insert into Core_EntityHistoryEvents (Id, EntityPropertyChangeId, EventType, Description)
			select NEWID(),
				(select cast(id as bigint) from AbpEntityPropertyChanges pc where
					pc.EntityChangeId = (select id from AbpEntityChanges ec where ec.EntityChangeSetId = @ecsId and ec.ChangeType = coalesce(c.ChangeType, 1) and ec.EntityId = c.EntityId and ec.EntityTypeFullName = c.EntityTypeFullName)
					and pc.PropertyName = c.PropertyName and pc.PropertyTypeFullName = c.PropertyTypeFullName) as ecpId,
				'PROPERTY_CHANGE_FRIENDLY_TEXT',
				c.Description
				from @changes c
				where not ltrim(rtrim(coalesce(c.PropertyName, ''))) = '' and not ltrim(rtrim(coalesce(c.Description, ''))) = '';

		/* Insert Descriptions for EntityChanges */
		insert into Core_EntityHistoryEvents (Id, EntityChangeId, EventType, Description)
			select NEWID(),
				(select id from AbpEntityChanges ec where ec.EntityChangeSetId = @ecsId and ec.ChangeType = coalesce(c.ChangeType, 1) and ec.EntityId = c.EntityId and ec.EntityTypeFullName = c.EntityTypeFullName),
				'ENTITY_EVENT',
				c.Description
				from @changes c
				where c.PropertyName is null and not ltrim(rtrim(coalesce(c.Description, ''))) = '';
	end
END
");

            Execute.Sql(
@"
CREATE PROCEDURE Core_AddSingleEntityHistoryEvent
@changeTime datetime, 
@reason nvarchar(max),
@tenantId int,
@userId int,

/* 0 - Created, 1 - Updated, 2 - Deleted*/
@changeType tinyint,
@entityId nvarchar(48),
@entityTypeFullName nvarchar(192),

@propertyName nvarchar(96),
@propertyTypeFullName nvarchar(256),
@newValue nvarchar(512),
@oldValue nvarchar(512),

/* optional */
@description nvarchar(512)
AS
BEGIN

	Declare @changes Core_EntityHistoryItem

	Insert into @changes SELECT @changeType, @entityId, @entityTypeFullName, @propertyName, @propertyTypeFullName, @newValue, @oldValue, @description

	exec [dbo].[Core_AddEntityHistoryEvents] @changeTime, @reason, @tenantId, @userId, @changes
END
");

        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
