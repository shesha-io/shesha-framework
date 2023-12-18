using FluentMigrator;
using Shesha.FluentMigrator;
using System;

namespace Shesha.Migrations
{
    [Migration(20231218134600)]
    public class M20231218134600 : Migration
    {
        /// <summary>
        /// 
        /// </summary>
        public override void Up()
        {
            Execute.Sql(@"
		            CREATE OR ALTER VIEW [dbo].[vw_Frwk_EntityChangeAuditLogs]
			            AS
                        SELECT 
                          ec.EntityId as Id,
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

        /// <summary>
        /// 
        /// </summary>
        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
