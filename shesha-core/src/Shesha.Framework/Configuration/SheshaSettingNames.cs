namespace Shesha.Configuration
{
    public static class SheshaSettingNames
    {
        public const string UploadFolder = "Shesha.UploadFolder";

        public static class Security
        {
            public const string AutoLogoffTimeout = "Shesha.Security.AutoLogoffTimeout";

            // Password reset settings
            public const string ResetPasswordWithEmailLinkIsSupported = "Shesha.Security.ResetPasswordWithEmailLinkIsSupported";
            public const string ResetPasswordWithEmailLinkExpiryDelay = "Shesha.Security.ResetPasswordWithEmailLinkExpiryDelay";
            public const string ResetPasswordWithSmsOtpIsSupported = "Shesha.Security.ResetPasswordWithSmsOtpIsSupported";
            public const string ResetPasswordWithSmsOtpExpiryDelay = "Shesha.Security.ResetPasswordWithSmsOtpExpiryDelay";
            public const string MobileLoginPinLifetime = "Shesha.Security.MobileLoginPinLifetime";            
            public const string ResetPasswordWithSecurityQuestionsIsSupported = "Shesha.Security.ResetPasswordWithSecurityQuestionsIsSupported";
            public const string ResetPasswordWithSecurityQuestionsNumQuestionsAllowed = "Shesha.Security.ResetPasswordWithSecurityQuestionsNumQuestionsAllowed";
        }

        public static class Sms
        {
            public const string SmsGateway = "Shesha.Sms.SmsGateway";
            public const string RedirectAllMessagesTo = "Shesha.Sms.RedirectAllMessagesTo";
        }

        public static class Email
        {
            //public const string SupportSmtpRelay = "Shesha.Email.SupportSmtpRelay";
            public const string RedirectAllMessagesTo = "Shesha.Email.RedirectAllMessagesTo";
            public const string EmailsEnabled = "Shesha.Email.EmailsEnabled";
            public const string SmtpSettings = "Shesha.SmtpSettings";
        }
    }
}
