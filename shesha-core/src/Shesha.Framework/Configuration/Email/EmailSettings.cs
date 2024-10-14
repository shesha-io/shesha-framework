namespace Shesha.Configuration
{
    /// <summary>
    /// Email settings
    /// </summary>
    public class EmailSettings
    {
        /// <summary>
        /// If true, all emails are enabled
        /// </summary>
        public bool EmailsEnabled { get; set; }

        /// <summary>
        /// If not null or empty the all outgoing emails will be sent to this email address, is used for testing only
        /// </summary>
        public string RedirectAllMessagesTo { get; set; }
    }
}
