using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20240506174800)]
    public class M20240506174800 : OneWayMigration
    {
        public override void Up()
        {
            IfDatabase("SqlServer").Execute.Sql(@"
		            CREATE OR ALTER VIEW [dbo].[vw_Frwk_EntityChangeAuditLogs]
			            AS
                        SELECT 
						  ec.Id as Id,
                          convert(nvarchar(50), ec.EntityId) as EntityId,
                          epc.PropertyName,
                          epc.OriginalValue,
                          epc.NewValue,
                          ec.EntityTypeFullName,
                          ecs.CreationTime,
                          Concat(abpU.Name,' ',abpU.Surname)  as ActionedBy,
                          CASE
                              WHEN ChangeType = 0 THEN 'Created'
                              WHEN ChangeType = 1 THEN 'Updated'
                              WHEN ChangeType = 2 THEN 'Deleted'
                              ELSE 'Other'
                          END AS ChangeType
                        FROM [AbpEntityChanges] ec
                        LEFT JOIN [AbpEntityPropertyChanges] epc on epc.EntityChangeId = ec.Id
                        LEFT JOIN [AbpEntityChangeSets] ecs on ecs.Id = ec.EntityChangeSetId
                        INNER JOIN [AbpUsers] abpU on abpU.Id = ecs.UserId
                    GO
            ");
        }
    }
}
