using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20260514120000)]
    public class M20260514120000 : OneWayMigration
    {
        public override void Up()
        {
            if (!Schema.Table("AbpUsers").Column("SecurityQuestionFailedAttempts").Exists())
            {
                Alter.Table("AbpUsers")
                    .AddColumn("SecurityQuestionFailedAttempts").AsInt32().Nullable();
            }

            if (!Schema.Table("AbpUsers").Column("SecurityQuestionLockoutEnd").Exists())
            {
                Alter.Table("AbpUsers")
                    .AddColumn("SecurityQuestionLockoutEnd").AsDateTime().Nullable();
            }
        }
    }
}
