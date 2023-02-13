using System;
using FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20200701182600)]
    public class M20200701182600: Migration
    {
        public override void Up()
        {
            Execute.Sql(
                @"IF EXISTS(SELECT* FROM sys.triggers WHERE object_id = OBJECT_ID(N'[dbo].[trg_Frwk_UserLoginAttempts_UpdateLastLoginDate_AI]'))
    DROP TRIGGER[dbo].[trg_Frwk_UserLoginAttempts_UpdateLastLoginDate_AI]");
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}