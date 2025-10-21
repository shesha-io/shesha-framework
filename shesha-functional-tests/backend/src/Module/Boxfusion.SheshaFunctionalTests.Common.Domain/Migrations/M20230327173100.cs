using FluentMigrator;
using Shesha.FluentMigrator;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20230327173100)]
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
