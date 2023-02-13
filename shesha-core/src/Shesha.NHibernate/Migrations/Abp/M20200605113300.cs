using System;
using FluentMigrator;

namespace Shesha.Migrations.Abp
{
    [Migration(20200605113300)]
    public class M20200605113300: Migration
    {
        public override void Up()
        {
            // delete trigger temporary, we have problem on out test environment
            Execute.Sql(@"IF EXISTS(SELECT* FROM sys.triggers WHERE object_id = OBJECT_ID(N'[dbo].[trg_Frwk_UserLoginAttempts_UpdateLastLoginDate_AI]'))
    DROP TRIGGER[dbo].[trg_Frwk_UserLoginAttempts_UpdateLastLoginDate_AI]");
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
