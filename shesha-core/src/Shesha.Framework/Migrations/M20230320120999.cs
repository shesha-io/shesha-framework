using FluentMigrator;
using Shesha.FluentMigrator;
using System;

namespace Shesha.Migrations
{
    [Migration(20230320120999), MsSqlOnly]
    public class M20230320120999 : OneWayMigration
    {
        public override void Up()
        {
            Rename.Column("Result").OnTable("Frwk_UserLoginAttempts").To("ResultLkp");

            Execute.Sql(@"ALTER TRIGGER [dbo].[trg_Frwk_UserLoginAttempts_UpdateLastLoginDate_AI]
   ON  [dbo].[Frwk_UserLoginAttempts]
   AFTER insert
AS 
BEGIN
	SET NOCOUNT ON;
	
	update 
		AbpUsers 
	set 
		LastLoginDate = i.CreationTime
	from
		AbpUsers
		inner join inserted i on i.UserId = AbpUsers.Id
	where
		i.UserId is not null
		and i.ResultLkp = 1
END");
        }
    }
}
