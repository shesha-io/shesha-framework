using Shesha.Configuration;
using Shesha.Settings;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Sms.Configuration
{
    public class SmsSettings
    {
        /// <summary>
        /// SMS Gateway
        /// </summary>
        public string SmsGateway { get; set; }

        /// <summary>
        /// Redirect all messages to.
        /// Is used for testing purposes only
        /// </summary>
        public string RedirectAllMessagesTo { get; set; }
    }
}
