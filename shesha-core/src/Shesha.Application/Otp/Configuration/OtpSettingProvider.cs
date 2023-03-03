using Abp.Dependency;
using Shesha.Settings;

namespace Shesha.Otp.Configuration
{
    public class OtpSettingProvider : SettingDefinitionProvider, ITransientDependency
    {
        public const string CategoryOtp = "One Time Pins";
        public const int DefaultPasswordLength = 6;
        public const string DefaultAlphabet = "0123456789";
        public const int DefaultLifetime = 3*60;
        public const string DefaultSubjectTemplate = "One-Time-Pin";
        public const string DefaultBodyTemplate = "Your One-Time-Pin is {{password}}";
        public const string DefaultEmailSubjectTemplate = "Reset Password";
        public const string DefaultEmailBodyTemplate = @"Please click on this link to reset your password: https://localhost/dynamic/verify-email?token={{token}}&identifier={{userid}}";

        public override void Define(ISettingDefinitionContext context)
        {
            context.Add(
                new SettingDefinition<int>(
                    OtpSettingsNames.PasswordLength,
                    DefaultPasswordLength,
                    "Password length"
                )
                { Category = CategoryOtp },

                new SettingDefinition<string>(
                    OtpSettingsNames.Alphabet,
                    DefaultAlphabet,
                    "Alphabet"
                )
                { Category = CategoryOtp },

                new SettingDefinition<int>(
                    OtpSettingsNames.DefaultLifetime,
                    DefaultLifetime,
                    "Pin lifetime"
                )
                { Category = CategoryOtp },

                new SettingDefinition<bool>(
                    OtpSettingsNames.IgnoreOtpValidation,
                    false,
                    "Ignore OTP validation"
                )
                { Category = CategoryOtp },

                new SettingDefinition<string>(
                    OtpSettingsNames.DefaultSubjectTemplate,
                    DefaultSubjectTemplate,
                    "Subject template"
                )
                { Category = CategoryOtp },

                new SettingDefinition<string>(
                    OtpSettingsNames.DefaultBodyTemplate,
                    DefaultBodyTemplate,
                    "Body template"
                )
                { Category = CategoryOtp },

                new SettingDefinition<string>(
                    OtpSettingsNames.DefaultEmailSubjectTemplate,
                    DefaultEmailSubjectTemplate,
                    "Email link subject template"
                )
                { Category = CategoryOtp },

                new SettingDefinition<string>(
                    OtpSettingsNames.DefaultEmailBodyTemplate,
                    DefaultEmailBodyTemplate,
                    "Email link body template"
                )
                { Category = CategoryOtp }
            );
        }
    }
}
