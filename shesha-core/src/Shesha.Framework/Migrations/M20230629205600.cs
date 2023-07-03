using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20230629205600)]
    public class M20230629205600 : Migration
    {
        public override void Down()
        {
            throw new System.NotImplementedException();
        }

        public override void Up()
        {
            Alter.Table("Frwk_ImportResults").AddColumn("LogFilePath").AsString(300).Nullable();
        }
    }
}
