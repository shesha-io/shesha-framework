using DocumentFormat.OpenXml.Wordprocessing;
using Shesha.Settings;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Sms.BulkSms
{
    /// <summary>
    /// BulkSms settings
    /// </summary>
    [Category("Bulk SMS")]
    public interface IBulkSmsSettings : ISettingAccessors
    {
        /// <summary>
        /// Host
        /// </summary>
        [Display(Name = "Api Url")]
        [Setting(BulkSmsSettingNames.ApiUrl)]
        ISettingAccessor<string> ApiUrl { get; }

        /// <summary>
        /// Api Username
        /// </summary>
        [Display(Name = "Api Username")]
        [Setting(BulkSmsSettingNames.ApiUsername)]
        ISettingAccessor<string> ApiUsername { get; }

        /// <summary>
        /// Api Password
        /// </summary>
        [Display(Name = "Api Password")]
        [Setting(BulkSmsSettingNames.ApiPassword)]
        ISettingAccessor<string> ApiPassword { get; }

        /// <summary>
        /// Use Proxy
        /// </summary>
        [Display(Name = "Use Proxy")]
        [Setting(BulkSmsSettingNames.UseProxy)]
        ISettingAccessor<bool> UseProxy { get; }

        /// <summary>
        /// Use default proxy credentials
        /// </summary>
        [Display(Name = "Use default proxy credentials")]
        [Setting(BulkSmsSettingNames.UseDefaultProxyCredentials)]
        ISettingAccessor<bool> UseDefaultProxyCredentials { get; }

        /// <summary>
        /// Web Proxy Address
        /// </summary>
        [Display(Name = "Web Proxy Address")]
        [Setting(BulkSmsSettingNames.WebProxyAddress)]
        ISettingAccessor<string> WebProxyAddress { get; }

        /// <summary>
        /// Proxy Login
        /// </summary>
        [Display(Name = "Proxy Login")]
        [Setting(BulkSmsSettingNames.WebProxyUsername)]
        ISettingAccessor<string> WebProxyUsername { get; }

        /// <summary>
        /// Proxy Password
        /// </summary>
        [Display(Name = "Proxy Password")]
        [Setting(BulkSmsSettingNames.WebProxyPassword)]
        ISettingAccessor<string> WebProxyPassword { get; }
    }

}
