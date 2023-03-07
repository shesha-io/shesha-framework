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
        [SettingAttribute(Xml2SmsSettingNames.Host)]
        ISettingAccessor<string> Host { get; }

        /// <summary>
        /// Api Username
        /// </summary>
        [Display(Name = "Api Username")]
        [SettingAttribute(Xml2SmsSettingNames.ApiUsername)]
        ISettingAccessor<string> ApiUsername { get; }

        /// <summary>
        /// Api Password
        /// </summary>
        [Display(Name = "Api Password")]
        [SettingAttribute(Xml2SmsSettingNames.ApiPassword)]
        ISettingAccessor<string> ApiPassword { get; }

        /// <summary>
        /// Use Proxy
        /// </summary>
        [Display(Name = "Use Proxy")]
        [SettingAttribute(Xml2SmsSettingNames.UseProxy)]
        ISettingAccessor<bool> UseProxy { get; }

        /// <summary>
        /// Use default proxy credentials
        /// </summary>
        [Display(Name = "Use default proxy credentials")]
        [SettingAttribute(Xml2SmsSettingNames.UseDefaultProxyCredentials)]
        ISettingAccessor<bool> UseDefaultProxyCredentials { get; }

        /// <summary>
        /// Web Proxy Address
        /// </summary>
        [Display(Name = "Web Proxy Address")]
        [SettingAttribute(Xml2SmsSettingNames.WebProxyAddress)]
        ISettingAccessor<string> WebProxyAddress { get; }

        /// <summary>
        /// Proxy Login
        /// </summary>
        [Display(Name = "Proxy Login")]
        [SettingAttribute(Xml2SmsSettingNames.WebProxyUsername)]
        ISettingAccessor<string> WebProxyUsername { get; }

        /// <summary>
        /// Proxy Password
        /// </summary>
        [Display(Name = "Proxy Password")]
        [SettingAttribute(Xml2SmsSettingNames.WebProxyPassword)]
        ISettingAccessor<string> WebProxyPassword { get; }
    }
}
