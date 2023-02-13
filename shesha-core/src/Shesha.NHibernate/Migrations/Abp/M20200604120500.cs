using System;
using FluentMigrator;

namespace Shesha.Migrations.Abp
{
    [Migration(20200604120500)]
    public class M20200604120500: Migration
    {
        public override void Up()
        {
            Alter.Table("AbpUsers").AddColumn("LastLoginDate").AsDateTime().Nullable();
            
            Execute.Sql(
@"update 
	AbpUsers 
set 
	LastLoginDate = (
		select 
			max(la.CreationTime)
		from
			Frwk_UserLoginAttempts la 
		where
			la.UserId = AbpUsers.Id 
			and la.Result = 1 /*Success*/
	)");

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
