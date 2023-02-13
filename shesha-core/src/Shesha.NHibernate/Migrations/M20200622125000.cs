using FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20200622125000)]
    public class M20200622125000: Migration
    {
        public override void Up()
        {
            Execute.Sql("CREATE NONCLUSTERED INDEX idx_Frwk_ReferenceLists_Name ON Frwk_ReferenceLists (Namespace, Name)");
        }

        public override void Down()
        {
            throw new System.NotImplementedException();
        }
    }
}
