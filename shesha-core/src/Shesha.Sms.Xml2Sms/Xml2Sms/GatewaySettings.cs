using System.ComponentModel.DataAnnotations;

namespace Shesha.Sms.Xml2Sms
{
    /// <summary>
    /// Xml2Sms gateway settings
    /// </summary>
    public class GatewaySettings
    {
        [Display(Name = "Host")]
        public string Host { get; set; }

        [Display(Name = "Api Username")]
        public string Username { get; set; }

        [Display(Name = "Api Password")]
        public string Password { get; set; }

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
