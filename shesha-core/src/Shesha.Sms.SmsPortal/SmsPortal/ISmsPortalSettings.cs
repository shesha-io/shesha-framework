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
        [SettingAttribute(SmsPortalSettingNames.Host)]
        ISettingAccessor<string> Host { get; }

        /// <summary>
        /// Api Username
        /// </summary>
        [Display(Name = "SmsPortal Login")]
        [SettingAttribute(SmsPortalSettingNames.Username)]
        ISettingAccessor<string> ApiUsername { get; }

        /// <summary>
        /// Api Password
        /// </summary>
        [Display(Name = "SmsPortal Password")]
        [SettingAttribute(SmsPortalSettingNames.Password)]
        ISettingAccessor<string> ApiPassword { get; }

        /// <summary>
        /// Use Proxy
        /// </summary>
        [Display(Name = "Use Proxy")]
        [SettingAttribute(SmsPortalSettingNames.UseProxy)]
        ISettingAccessor<bool> UseProxy { get; }

        /// <summary>
        /// Use default proxy credentials
        /// </summary>
        [Display(Name = "Use default proxy credentials")]
        [SettingAttribute(SmsPortalSettingNames.UseDefaultProxyCredentials)]
        ISettingAccessor<bool> UseDefaultProxyCredentials { get; }

        /// <summary>
        /// Web Proxy Address
        /// </summary>
        [Display(Name = "Web Proxy Address")]
        [SettingAttribute(SmsPortalSettingNames.WebProxyAddress)]
        ISettingAccessor<string> WebProxyAddress { get; }

        /// <summary>
        /// Proxy Login
        /// </summary>
        [Display(Name = "Proxy Login")]
        [SettingAttribute(SmsPortalSettingNames.WebProxyUsername)]
        ISettingAccessor<string> WebProxyUsername { get; }

        /// <summary>
        /// Proxy Password
        /// </summary>
        [Display(Name = "Proxy Password")]
        [SettingAttribute(SmsPortalSettingNames.WebProxyPassword)]
        ISettingAccessor<string> WebProxyPassword { get; }
    }
}
