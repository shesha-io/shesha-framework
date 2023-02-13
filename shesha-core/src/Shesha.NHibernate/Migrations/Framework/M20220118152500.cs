using FluentMigrator;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Migrations.Framework
{
    [Migration(20220118152500)]
    public class M20220118152500 : Migration
    {
        public override void Down()
        {
            throw new NotImplementedException();
        }

        public override void Up()
        {
            Execute.Sql("update Frwk_EntityProperties set SourceLkp = 2 /*UserDefined*/ where SourceLkp is null");
        }
    }
}
