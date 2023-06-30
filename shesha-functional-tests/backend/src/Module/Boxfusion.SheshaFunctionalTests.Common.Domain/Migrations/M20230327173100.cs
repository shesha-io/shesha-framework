using FluentMigrator;
using System;
using Shesha.FluentMigrator;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20230327173100), MsSqlOnly]
    public class M20230327173100 : AutoReversingMigration
    {
        public override void Up()
        {
                Alter.Table("SheshaFunctionalTests_Employees")
                    .AddColumn("RichTextEditor").AsStringMax().Nullable();

                Alter.Table("SheshaFunctionalTests_Employees").AddForeignKeyColumn("OtherDocumentsId", "Frwk_StoredFiles");

                Alter.Table("SheshaFunctionalTests_Employees").AddForeignKeyColumn("PaySlipId", "Frwk_StoredFiles");

                Alter.Table("SheshaFunctionalTests_Employees").AddForeignKeyColumn("NoteId", "Core_Notes");
        }
    }
}
