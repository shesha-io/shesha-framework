using System;
using FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20200611124800)]
    public class M20200611124800 : Migration
    {
        public override void Up()
        {

            Execute.Sql(
@"
ALTER VIEW [dbo].[vw_Core_EntityHistoryItems]
AS
SELECT 
ec.Id,
ecs.Id AS EntityChangeSetId,
ecs.CreationTime,
ec.Id as EntityChangeId,
ec.ChangeType,
ec.EntityId,
ec.EntityTypeFullName,
pc.PropertyTypeFullName,
pc.PropertyName,
pc.OriginalValue,
pc.NewValue,
p.Id AS PersonId,
p.FullName AS UserFullName,
ecs.UserId,
ec.TenantId
FROM AbpEntityChanges AS ec
inner join AbpEntityChangeSets AS ecs ON ecs.Id = ec.EntityChangeSetId 
inner join AbpEntityPropertyChanges pc on pc.EntityChangeId = ec.id
left outer join Core_Persons AS p ON p.UserId = ecs.UserId

");
		}

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
