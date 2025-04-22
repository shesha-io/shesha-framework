using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20250414174799)]
    public class M20250414174799 : OneWayMigration
    {
        public override void Up()
        {
            IfDatabase("PostgreSql").Execute.Sql(@"create or replace VIEW ""vw_Frwk_EntityChangeAuditLogs""
    AS
    SELECT 
	  ec.""Id"" as ""Id"",
      cast(ec.""EntityId"" as varchar(50)) as ""EntityId"",
      epc.""PropertyName"",
      epc.""OriginalValue"",
      epc.""NewValue"",
      ec.""EntityTypeFullName"",
      ecs.""CreationTime"",
      Concat(abpU.""Name"", ' ', abpU.""Surname"") as ""ActionedBy"",
      CASE
          WHEN ""ChangeType"" = 0 THEN 'Created'
          WHEN ""ChangeType"" = 1 THEN 'Updated'
          WHEN ""ChangeType"" = 2 THEN 'Deleted'
          ELSE 'Other'
      END AS ""ChangeType""
    FROM ""AbpEntityChanges"" ec
    LEFT JOIN ""AbpEntityPropertyChanges"" epc on epc.""EntityChangeId"" = ec.""Id""
    LEFT JOIN ""AbpEntityChangeSets"" ecs on ecs.""Id"" = ec.""EntityChangeSetId""
    INNER JOIN ""AbpUsers"" abpU on abpU.""Id"" = ecs.""UserId""");
        }
    }
}
