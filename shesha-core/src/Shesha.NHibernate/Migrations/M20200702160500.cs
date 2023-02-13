using System;
using FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20200702160500)]
    public class M20200702160500: Migration
    {
        public override void Up()
        {
            // restored trigger
            Execute.Sql(
                @"IF EXISTS(SELECT* FROM sys.triggers WHERE object_id = OBJECT_ID(N'[dbo].[trg_Frwk_UserLoginAttempts_UpdateLastLoginDate_AI]'))
    DROP TRIGGER[dbo].[trg_Frwk_UserLoginAttempts_UpdateLastLoginDate_AI]");

            Execute.Sql(
                @"CREATE TRIGGER trg_Frwk_UserLoginAttempts_UpdateLastLoginDate_AI
   ON  Frwk_UserLoginAttempts
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
		and i.Result = 1
END");
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
