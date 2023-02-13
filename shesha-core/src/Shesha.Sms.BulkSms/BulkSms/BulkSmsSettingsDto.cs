using System.ComponentModel.DataAnnotations;

namespace Shesha.Sms.BulkSms
{
    /// <summary>
    /// Represents BulkSMS gateway settings
    /// </summary>
    public class BulkSmsSettingsDto
    {
        /// <summary>
        /// Bulk SMS url
        /// </summary>
        public string ApiUrl { get; set; }

        /// <summary>
        /// BulkSms Username
        /// </summary>
        public string ApiUsername { get; set; }

        /// <summary>
        /// BulkSms Password
        /// </summary>
        public string ApiPassword { get; set; }

        /// <summary>
        /// Use proxy
        /// </summary>
        [Display(Name = "Use proxy")]
        public bool UseProxy { get; set; }

        [Display(Name = "Proxy address")]
        public string WebProxyAddress { get; set; }

        /// <summary>
        /// Use default credentials for proxy 
        /// </summary>
        [Display(Name = "Use default credentials for proxy")]
        public bool UseDefaultProxyCredentials { get; set; }

        [Display(Name = "Proxy username")]
        public string WebProxyUsername { get; set; }

        [Display(Name = "Proxy password")]
        public string WebProxyPassword { get; set; }
    }
}
