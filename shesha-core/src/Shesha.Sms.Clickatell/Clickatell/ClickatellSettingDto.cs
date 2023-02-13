using System.ComponentModel.DataAnnotations;

namespace Shesha.Sms.Clickatell
{
    /// <summary>
    /// Clickatell settings DTO
    /// </summary>
    public class ClickatellSettingDto
    {
        /// <summary>
        /// Clickatell Api Username
        /// </summary>
        [Display(Name = "Clickatell Host")]
        public string ClickatellHost { get; set; }

        /// <summary>
        /// Clickatell Api Username
        /// </summary>
        [Display(Name = "Clickatell Api Username")]
        public string ClickatellApiUsername { get; set; }

        /// <summary>
        /// Clickatell Api Password
        /// </summary>
        [Display(Name = "Clickatell Api Password")]
        public string ClickatellApiPassword { get; set; }


        /// <summary>
        /// Clickatell Api ID
        /// </summary>
        [Display(Name = "Clickatell Api ID")]
        public string ClickatellApiId { get; set; }

        /// <summary>
        /// Max length of single message (default is 160 but may be different in different regions/countries)
        /// </summary>
        [Display(Name = "Max length of single message")]
        public int SingleMessageMaxLength { get; set; }

        /// <summary>
        /// Message part length
        /// </summary>
        [Display(Name = "Message part length", Description = "Is used for multipart messages (153 by default)")]
        public int MessagePartLength { get; set; }

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
