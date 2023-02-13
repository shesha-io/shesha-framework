using System;
using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20210413153000)]
    public class M20210413153000: Migration
    {
        public override void Up()
        {
            Create.Column("Expression").OnTable("Frwk_StoredFilters").AsStringMax().Nullable();
            Execute.Sql(@"update Frwk_StoredFilters set Expression = (case when StoredFilterTypeLkp = 1 then HqlExpression when StoredFilterTypeLkp = 2 then JsonLogicExpression else null end)");

            Delete.Column("HqlExpression").FromTable("Frwk_StoredFilters");
            Delete.Column("JsonLogicExpression").FromTable("Frwk_StoredFilters");

            Rename.Column("StoredFilterTypeLkp").OnTable("Frwk_StoredFilters").To("ExpressionTypeLkp");
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
