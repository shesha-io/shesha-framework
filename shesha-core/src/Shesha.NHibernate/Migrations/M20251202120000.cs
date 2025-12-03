using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20251202120000)]
    public class M20251202120000 : OneWayMigration
    {
        public override void Up()
        {
            // Add IsReplaced column to StoredFiles table
            Alter.Table("Frwk_StoredFiles")
                .AddColumn("IsReplaced").AsBoolean().NotNullable().WithDefaultValue(false);

            // Create StoredFileReplacements junction table
            Create.Table("Frwk_StoredFileReplacements")
                .WithIdAsGuid()
                .WithColumn("NewFileId").AsGuid().NotNullable()
                .WithColumn("ReplacedFileId").AsGuid().NotNullable()
                .WithColumn("ReplacementDate").AsDateTime().NotNullable();

            // Add foreign key constraints
            Create.ForeignKey("FK_Frwk_StoredFileReplacements_NewFileId_Frwk_StoredFiles")
                .FromTable("Frwk_StoredFileReplacements").ForeignColumn("NewFileId")
                .ToTable("Frwk_StoredFiles").PrimaryColumn("Id");

            Create.ForeignKey("FK_Frwk_StoredFileReplacements_ReplacedFileId_Frwk_StoredFiles")
                .FromTable("Frwk_StoredFileReplacements").ForeignColumn("ReplacedFileId")
                .ToTable("Frwk_StoredFiles").PrimaryColumn("Id");
        }
    }
}
