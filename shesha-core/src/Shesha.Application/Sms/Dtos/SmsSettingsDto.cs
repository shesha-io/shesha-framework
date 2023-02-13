using System.Collections.Generic;

namespace Shesha.Sms.Dtos
{
    /// <summary>
    /// Represents sms settings
    /// </summary>
    public class SmsSettingsDto
    {
        /// <summary>
        /// Selected sms gateway
        /// </summary>
        public string Gateway { get; set; }

        /// <summary>
        /// If specified, all sms messages will be redirected to this number. Is used for testing purposes
        /// </summary>
        public string RedirectAllMessagesTo { get; set; }
    }
}
