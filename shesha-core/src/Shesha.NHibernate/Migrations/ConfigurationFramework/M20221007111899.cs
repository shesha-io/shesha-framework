using FluentMigrator;
using Shesha.FluentMigrator;
using System;

namespace Shesha.Migrations.ConfigurationFramework
{
    [Migration(20221007111899), MsSqlOnly]
    public class M20221007111899 : OneWayMigration
    {
        public override void Up()
        {
            Execute.Sql(
@"create unique index 
	uq_Frwk_Modules_Name
on 
	Frwk_Modules(Name)
where 
	IsDeleted = 0");
        }
    }
}
