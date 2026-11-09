using Shesha.UserManagements.Configurations;
using System.Threading.Tasks;

namespace Shesha.UserRegistrations
{
    /// <summary>
    /// Resolves the effective user management/self-registration settings for a front-end application
    /// </summary>
    public interface ISelfRegistrationSettingsProvider
    {
        /// <summary>
        /// Returns the settings of the specified front-end application (current application when null).
        /// Falls back to the value saved without an application, then to the default value.
        /// </summary>
        Task<EffectiveUserManagementSettings> GetSettingsAsync(string appKey = null);
    }

    /// <summary>
    /// User management settings with self-registration defaults applied
    /// </summary>
    public class EffectiveUserManagementSettings
    {
        public EffectiveUserManagementSettings(UserManagementSettings settings, bool isSelfRegistrationEnabled)
        {
            Settings = settings;
            IsSelfRegistrationEnabled = isSelfRegistrationEnabled;
        }

        /// <summary>
        /// Raw settings value (never null)
        /// </summary>
        public UserManagementSettings Settings { get; }

        /// <summary>
        /// True when anonymous users may register: self-registration is allowed and a registration method is configured
        /// </summary>
        public bool IsSelfRegistrationEnabled { get; }
    }
}
