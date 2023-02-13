using FluentMigrator;

namespace Shesha.Migrations.Framework
{
    [Migration(20220307121899)]
    public class M20220307121899 : AutoReversingMigration
    {
        public override void Up()
        {
            Alter.Table("Frwk_EntityVisibility").AlterColumn("EntityAccessLkp").AsInt64().NotNullable();
            Alter.Table("Frwk_OtpAuditItems").AlterColumn("SendTypeLkp").AsInt64().NotNullable();
            Alter.Table("Frwk_OtpAuditItems").AlterColumn("SendStatusLkp").AsInt64().NotNullable();
            Alter.Table("Frwk_StoredFilters").AlterColumn("ExpressionTypeLkp").AsInt64().NotNullable();
            Alter.Table("Frwk_StoredFilters").AlterColumn("ColumnFilterComparerTypeLkp").AsInt64().Nullable();
            Alter.Table("Frwk_StoredFilterRelations").AlterColumn("JoinOperatorLkp").AsInt64().NotNullable();
        }
    }
}
