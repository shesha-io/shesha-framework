using FluentMigrator;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Migrations.Framework
{
    [Migration(20220209170599)]
    public class M20220209170599 : AutoReversingMigration
    {
        public override void Up()
        {
            Alter.Table("Frwk_EntityProperties").AddColumn("IsFrameworkRelated").AsBoolean().SetExistingRowsTo(0);
        }
    }
}
