using System;
using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20200607203600)]
    public class M20200607203600 : Migration
    {
        public override void Up()
        {
            Create.Table("Core_EntityHistoryEvents")
                .WithIdAsGuid()
                .WithForeignKeyColumnInt64("EntityChangeSetId", "AbpEntityChangeSets")
                .WithForeignKeyColumnInt64("EntityChangeId", "AbpEntityChanges")
                .WithForeignKeyColumnInt64("[EntityPropertyChangeId]", "AbpEntityPropertyChanges")
                .WithColumn("EventName").AsString(255).Nullable()
                .WithColumn("Description").AsString(512).Nullable()
                .WithColumn("EventType").AsString(255).Nullable();

            Execute.Sql(
@"CREATE VIEW [dbo].[vw_Core_EntityHistoryItems]
AS
SELECT ec.Id, ecs.Id AS EntityChangeSetId, ecs.CreationTime, ec.Id AS EntityChangeId, CASE WHEN NOT ehe.Description IS NULL THEN 5 ELSE ec.ChangeType END AS HistoryItemType, ec.ChangeType, ec.EntityId, ec.EntityTypeFullName, 
                  ehe.EventType, ehe.EventName, ehe.Description, p.Id AS PersonId, p.FullName AS UserFullName
FROM     dbo.AbpEntityChanges AS ec INNER JOIN
                  dbo.AbpEntityChangeSets AS ecs ON ecs.Id = ec.EntityChangeSetId LEFT OUTER JOIN
                  dbo.Core_EntityHistoryEvents AS ehe ON ehe.EntityChangeId = ec.Id LEFT OUTER JOIN
                  dbo.Core_Persons AS p ON p.UserId = ecs.UserId
");
		}

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
