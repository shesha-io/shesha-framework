using System.ComponentModel.DataAnnotations;

namespace Shesha.Sms.Xml2Sms
{
    /// <summary>
    /// Xml2Sms settings DTO
    /// </summary>
    public class Xml2SmsSettingDto
    {
        [Display(Name = "Xml2Sms Host")]
        public string Xml2SmsHost { get; set; }

        [Display(Name = "Xml2Sms Api Username")]
        public string Xml2SmsUsername { get; set; }

        [Display(Name = "Xml2Sms Api Password")]
        public string Xml2SmsPassword { get; set; }

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
