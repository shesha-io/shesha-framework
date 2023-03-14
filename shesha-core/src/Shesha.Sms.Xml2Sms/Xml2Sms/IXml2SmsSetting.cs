using Shesha.Settings;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Sms.Xml2Sms
{
    /// <summary>
    /// Xml2Sms settings
    /// </summary>
    [Category("Xml2Sms")]
    public interface IXml2SmsSetting : ISettingAccessors
    {
        /// <summary>
        /// Host
        /// </summary>
        [Display(Name = "Xml2Smsl Host")]
        [Setting(Xml2SmsSettingNames.Host)]
        ISettingAccessor<string> Host { get; }

        /// <summary>
        /// Api Username
        /// </summary>
        [Display(Name = "Api Username")]
        [Setting(Xml2SmsSettingNames.ApiUsername)]
        ISettingAccessor<string> ApiUsername { get; }

        /// <summary>
        /// Api Password
        /// </summary>
        [Display(Name = "Api Password")]
        [Setting(Xml2SmsSettingNames.ApiPassword)]
        ISettingAccessor<string> ApiPassword { get; }

        /// <summary>
        /// Use Proxy
        /// </summary>
        [Display(Name = "Use Proxy")]
        [Setting(Xml2SmsSettingNames.UseProxy)]
        ISettingAccessor<bool> UseProxy { get; }

        /// <summary>
        /// Use default proxy credentials
        /// </summary>
        [Display(Name = "Use default proxy credentials")]
        [Setting(Xml2SmsSettingNames.UseDefaultProxyCredentials)]
        ISettingAccessor<bool> UseDefaultProxyCredentials { get; }

        /// <summary>
        /// Web Proxy Address
        /// </summary>
        [Display(Name = "Web Proxy Address")]
        [Setting(Xml2SmsSettingNames.WebProxyAddress)]
        ISettingAccessor<string> WebProxyAddress { get; }

        /// <summary>
        /// Proxy Login
        /// </summary>
        [Display(Name = "Proxy Login")]
        [Setting(Xml2SmsSettingNames.WebProxyUsername)]
        ISettingAccessor<string> WebProxyUsername { get; }

        /// <summary>
        /// Proxy Password
        /// </summary>
        [Display(Name = "Proxy Password")]
        [Setting(Xml2SmsSettingNames.WebProxyPassword)]
        ISettingAccessor<string> WebProxyPassword { get; }
    }
}
