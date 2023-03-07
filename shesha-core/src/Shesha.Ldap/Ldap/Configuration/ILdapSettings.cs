using Shesha.Settings;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Ldap.Configuration
{
    /// <summary>
    /// LDAP Settings
    /// </summary>
    [Category("LDAP")]
    public interface ILdapSettings : ISettingAccessors
    {
        /// <summary>
        /// Is Enabled
        /// </summary>
        [Display(Name = "Is Enabled")]
        [Setting(LdapSettingNames.IsEnabled)]
        ISettingAccessor<bool> IsEnabled { get; }

        /// <summary>
        /// LDAP Server
        /// </summary>
        [Setting(LdapSettingNames.Server)]
        ISettingAccessor<string> Server { get; }

        /// <summary>
        /// Port
        /// </summary>
        [Setting(LdapSettingNames.Port)]
        ISettingAccessor<int> Port { get; }

        /// <summary>
        /// Use SSL
        /// </summary>
        [Display(Name = "Use SSL")]
        [Setting(LdapSettingNames.UseSsl)]
        ISettingAccessor<bool> UseSsl { get; }

        /// <summary>
        /// Domain
        /// </summary>
        [Setting(LdapSettingNames.IsEnabled)]
        ISettingAccessor<string> Domain { get; }
    }
}