using System;
using FluentMigrator;

namespace Shesha.Migrations
{
    /// <summary>
    /// 
    /// </summary>
    [Migration(20201210115000)]
    public class M20201210115000: Migration
    {
        public override void Up()
        {
            Execute.Sql(
                @"if not exists(select 1 from AbpSettings where Name = 'Shesha.Push.PushNotifier')
	insert into AbpSettings (CreationTime, Name, Value) values (getdate(), 'Shesha.Push.PushNotifier', '8DF00E45-1F6D-4CE6-82E8-A4C59497DCAE')
else
	update AbpSettings set Value = '8DF00E45-1F6D-4CE6-82E8-A4C59497DCAE' where Name = 'Shesha.Push.PushNotifier'	");
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
