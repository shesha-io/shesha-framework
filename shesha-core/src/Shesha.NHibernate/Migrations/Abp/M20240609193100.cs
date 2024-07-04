using FluentMigrator;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Migrations.Abp
{
    [Migration(20240609193100)]
    public class M20240609193100 : Migration
    {
        public override void Up()
        {
            Alter.Table("AbpUsers")
                .AddColumn("IsAnonymous").AsBoolean().Nullable();
        }
        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}