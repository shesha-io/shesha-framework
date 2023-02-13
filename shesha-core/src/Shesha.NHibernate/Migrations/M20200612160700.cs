using System;
using FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20200612160700)]
    public class M20200612160700: Migration
    {
        public override void Up()
        {
            Execute.Sql(
@"update 
	AbpSettings 
set
	Value = 'en-GB'
where 
	Name = 'Abp.Localization.DefaultLanguageName' 
	and Value not like 'en%'");
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
