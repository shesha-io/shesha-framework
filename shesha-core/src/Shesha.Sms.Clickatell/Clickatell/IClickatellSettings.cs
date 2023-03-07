using Shesha.Settings;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Sms.Clickatell
{
    /// <summary>
    /// Clickatell settings
    /// </summary>
    [Category("Clickatell")]
    public interface IClickatellSettings : ISettingAccessors
    {
        /// <summary>
        /// Host
        /// </summary>
        [Display(Name = "Clickatell Host")]
        [SettingAttribute(ClickatellSettingNames.Host)]
        ISettingAccessor<string> Host { get; }

        /// <summary>
        /// Api Id
        /// </summary>
        [Display(Name = "API Id")]
        [SettingAttribute(ClickatellSettingNames.ApiId)]
        ISettingAccessor<string> ApiId { get; }

        /// <summary>
        /// Api Username
        /// </summary>
        [Display(Name = "Clickatell Login")]
        [SettingAttribute(ClickatellSettingNames.ApiUsername)]
        ISettingAccessor<string> ApiUsername { get; }

        /// <summary>
        /// Api Password
        /// </summary>
        [Display(Name = "Clickatell Password")]
        [SettingAttribute(ClickatellSettingNames.ApiPassword)]
        ISettingAccessor<string> ApiPassword { get; }

        /// <summary>
        /// Use Proxy
        /// </summary>
        [Display(Name = "Use Proxy")]
        [SettingAttribute(ClickatellSettingNames.UseProxy)]
        ISettingAccessor<bool> UseProxy { get; }

        /// <summary>
        /// Use default proxy credentials
        /// </summary>
        [Display(Name = "Use default proxy credentials")]
        [SettingAttribute(ClickatellSettingNames.UseDefaultProxyCredentials)]
        ISettingAccessor<bool> UseDefaultProxyCredentials { get; }

        /// <summary>
        /// Web Proxy Address
        /// </summary>
        [Display(Name = "Web Proxy Address")]
        [SettingAttribute(ClickatellSettingNames.WebProxyAddress)]
        ISettingAccessor<string> WebProxyAddress { get; }

        /// <summary>
        /// Proxy Login
        /// </summary>
        [Display(Name = "Proxy Login")]
        [SettingAttribute(ClickatellSettingNames.WebProxyUsername)]
        ISettingAccessor<string> WebProxyUsername { get; }

        /// <summary>
        /// Proxy Password
        /// </summary>
        [Display(Name = "Proxy Password")]
        [SettingAttribute(ClickatellSettingNames.WebProxyPassword)]
        ISettingAccessor<string> WebProxyPassword { get; }

        /// <summary>
        /// Single message max length
        /// </summary>
        [Display(Name = "Single message max length")]
        [SettingAttribute(ClickatellSettingNames.SingleMessageMaxLength)]
        ISettingAccessor<int> SingleMessageMaxLength { get; }

        /// <summary>
        /// Message part length
        /// </summary>
        [Display(Name = "Message part length")]
        [SettingAttribute(ClickatellSettingNames.MessagePartLength)]
        ISettingAccessor<int> MessagePartLength { get; }
    }
}
