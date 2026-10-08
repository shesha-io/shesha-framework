using System.Threading.Tasks;

namespace Shesha.Otp
{
    /// <summary>
    /// Moves OTP message templates customised in the (obsolete) OTP settings into the notification templates of the OTP configurations
    /// </summary>
    public interface IOtpLegacyTemplatesMigrator
    {
        /// <summary>
        /// Migrate customised templates. Does nothing when the templates were not customised or were migrated already
        /// </summary>
        Task MigrateAsync();
    }
}
