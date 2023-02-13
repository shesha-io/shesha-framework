using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Sms.Dtos
{
    /// <summary>
    /// Represents sms settings
    /// </summary>
    public class SmsSettingsV2Dto
    {
        /// <summary>
        /// Selected sms gateway alias
        /// </summary>
        public string Gateway { get; set; }

        /// <summary>
        /// If specified, all sms messages will be redirected to this number. Is used for testing purposes
        /// </summary>
        public string RedirectAllMessagesTo { get; set; }

        public Dictionary<string, object> Gateways { get; set; } = new Dictionary<string, object>();
    }
}
