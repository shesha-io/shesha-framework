using System.Threading.Tasks;

namespace Shesha.Otp
{
    /// <summary>
    /// Moves OTP message templates customised in the (obsolete) OTP settings into the notification templates of the OTP configurations
    /// </summary>
    public interface IOtpLegacyTemplatesMigrator
    {
        /// <summary>
        /// Move customised templates and clear them in the settings. Does nothing when the settings contain no customised templates
        /// </summary>
        Task MigrateAsync();
    }
}
