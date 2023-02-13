using System.ComponentModel.DataAnnotations;

namespace Shesha.Sms
{
    /// <summary>
    /// Proxy server settings
    /// </summary>
    public interface IProxySettings
    {
        /// <summary>
        /// Web Proxy Address
        /// </summary>
        [Display(Name = "Web Proxy Address")]
        string WebProxyAddress { get; set; }

        /// <summary>
        /// Disable Proxy
        /// </summary>
        [Display(Name = "Use Proxy")]
        bool UseProxy { get; set; }

        /// <summary>
        /// Use AD Proxy
        /// </summary>
        [Display(Name = "Use default credentials")]
        bool UseDefaultProxyCredentials { get; set; }

        /// <summary>
        /// Web Proxy username
        /// </summary>
        [Display(Name = "Proxy username")]
        string ProxyUsername { get; set; }

        /// <summary>
        /// Web Proxy password
        /// </summary>
        [Display(Name = "Proxy password")]
        string ProxyPassword { get; set; }
    }
}
