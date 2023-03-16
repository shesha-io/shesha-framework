using Shesha.Settings;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Sms.SmsPortal
{
    /// <summary>
    /// SMS Portal settings
    /// </summary>
    [Category("SMS Portal")]
    public interface ISmsPortalSettings : ISettingAccessors
    {
        /// <summary>
        /// Host
        /// </summary>
        [Display(Name = "SmsPortal Host")]
        [Setting(SmsPortalSettingNames.Host)]
        ISettingAccessor<string> Host { get; }

        /// <summary>
        /// Api Username
        /// </summary>
        [Display(Name = "SmsPortal Login")]
        [Setting(SmsPortalSettingNames.Username)]
        ISettingAccessor<string> ApiUsername { get; }

        /// <summary>
        /// Api Password
        /// </summary>
        [Display(Name = "SmsPortal Password")]
        [Setting(SmsPortalSettingNames.Password)]
        ISettingAccessor<string> ApiPassword { get; }

        /// <summary>
        /// Use Proxy
        /// </summary>
        [Display(Name = "Use Proxy")]
        [Setting(SmsPortalSettingNames.UseProxy)]
        ISettingAccessor<bool> UseProxy { get; }

        /// <summary>
        /// Use default proxy credentials
        /// </summary>
        [Display(Name = "Use default proxy credentials")]
        [Setting(SmsPortalSettingNames.UseDefaultProxyCredentials)]
        ISettingAccessor<bool> UseDefaultProxyCredentials { get; }

        /// <summary>
        /// Web Proxy Address
        /// </summary>
        [Display(Name = "Web Proxy Address")]
        [Setting(SmsPortalSettingNames.WebProxyAddress)]
        ISettingAccessor<string> WebProxyAddress { get; }

        /// <summary>
        /// Proxy Login
        /// </summary>
        [Display(Name = "Proxy Login")]
        [Setting(SmsPortalSettingNames.WebProxyUsername)]
        ISettingAccessor<string> WebProxyUsername { get; }

        /// <summary>
        /// Proxy Password
        /// </summary>
        [Display(Name = "Proxy Password")]
        [Setting(SmsPortalSettingNames.WebProxyPassword)]
        ISettingAccessor<string> WebProxyPassword { get; }
    }
}
