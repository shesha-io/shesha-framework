using FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20191029154900)]
    public class M20191029154900: AutoReversingMigration
    {
        public override void Up()
        {
            Create.Table("Frwk_HiLoSequences")
                .WithColumn("SequenceName").AsString(200).NotNullable().PrimaryKey()
                .WithColumn("NextValue").AsInt64().NotNullable();

            Insert.IntoTable("Frwk_HiLoSequences").Row(
                new
                {
                    SequenceName = "FrameworkSequence",
                    NextValue = 1
                });
        }
    }
}
