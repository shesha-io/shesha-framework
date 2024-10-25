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
