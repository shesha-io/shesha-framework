namespace Shesha.Email
{
    public class SmtpSettingsDto
    {
        /// <summary>
        /// SMTP Host name/IP.
        /// </summary>
        public string Host { get; set; }

        /// <summary>
        /// SMTP Port.
        /// </summary>
        public int Port { get; set; }

        /// <summary>
        /// User name to login to SMTP server.
        /// </summary>
        public string UserName { get; set; }

        /// <summary>
        /// Password to login to SMTP server.
        /// </summary>
        public string Password { get; set; }

        /// <summary>
        /// Domain name to login to SMTP server.
        /// </summary>
        public string Domain { get; set; }

        /// <summary>
        /// Is SSL enabled?
        /// </summary>
        public bool EnableSsl { get; set; }

        /// <summary>
        /// Use default credentials?
        /// </summary>
        public bool UseDefaultCredentials { get; set; }

        /// <summary>
        /// Default from address.
        /// </summary>
        public string DefaultFromAddress { get; set; }

        /// <summary>
        /// Default display name.
        /// </summary>
        public string DefaultFromDisplayName { get; set; }
        
        /// <summary>
        /// If true, indicate that SMTP relay service will be used where it's needed (e.g. if the application needs to notify one person about the action that was performed by another person then real person's email address will be used for the "from" address, otherwise "Site Email" will be used)
        /// </summary>
        public bool SupportSmtpRelay { get; set; }

        /// <summary>
        /// If not null or empty the all outgoing emails will be sent to this email address, is used for testing
        /// </summary>
        public string RedirectAllMessagesTo { get; set; }

        /// <summary>
        /// If true, all emails will be disabled. Is used only for testing
        /// </summary>
        public bool EmailsEnabled { get; set; }
    }
}
