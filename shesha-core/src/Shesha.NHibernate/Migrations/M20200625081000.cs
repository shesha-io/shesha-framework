using System;
using FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20200625081000)]
    public class M20200625081000: Migration
    {
        public override void Up()
        {
            Execute.Sql(@"delete from AbpSettings where Name = 'Shesha.Otp.DefaultLifetime' and value = '0'");
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
