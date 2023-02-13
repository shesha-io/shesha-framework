using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20200610165000)]
    public class M20200610165000: AutoReversingMigration
    {
        public override void Up()
        {
            // Shesha.Domain.OtpAuditItem
            Create.Table("Frwk_OtpAuditItems")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithColumn("ActionType").AsString(100).Nullable()
                .WithColumn("ErrorMessage").AsStringMax().Nullable()
                .WithColumn("ExpiresOn").AsDateTime().Nullable()
                .WithColumn("Otp").AsString(100).Nullable()
                .WithColumn("RecipientId").AsString(40).Nullable()
                .WithColumn("RecipientType").AsString(100).Nullable()
                .WithColumn("SendStatusLkp").AsInt32()
                .WithColumn("SendTo").AsString(200).Nullable()
                .WithColumn("SentOn").AsDateTime().Nullable()
                .WithColumn("SendTypeLkp").AsInt32();
        }
    }
}
