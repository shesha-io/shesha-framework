using System.Collections.Generic;
using Abp.Configuration;

namespace Shesha.Otp.Configuration
{
    public class OtpSettingProvider : SettingProvider
    {
        public const int DefaultPasswordLength = 6;
        public const string DefaultAlphabet = "0123456789";
        public const int DefaultLifetime = 3*60;
        public const string DefaultSubjectTemplate = "One-Time-Pin";
        public const string DefaultBodyTemplate = "Your One-Time-Pin is {{password}}";
        public const string DefaultEmailSubjectTemplate = "Reset Password";
        public const string DefaultEmailBodyTemplate = @"Please click on this link to reset your password: https://pd-his-adminportal-test.azurewebsites.net/dynamic/verify-email?token={{token}}&identifier={{userid}}";

        public override IEnumerable<SettingDefinition> GetSettingDefinitions(SettingDefinitionProviderContext context)
        {
            return new[]
            {
                new SettingDefinition(
                    OtpSettingsNames.PasswordLength,
                    DefaultPasswordLength.ToString(),
                    scopes: SettingScopes.Application | SettingScopes.Tenant
                ),

                new SettingDefinition(
                    OtpSettingsNames.Alphabet,
                    DefaultAlphabet,
                    scopes: SettingScopes.Application | SettingScopes.Tenant
                ),

                new SettingDefinition(
                    OtpSettingsNames.DefaultLifetime,
                    DefaultLifetime.ToString(),
                    scopes: SettingScopes.Application | SettingScopes.Tenant
                ),

                new SettingDefinition(
                    OtpSettingsNames.IgnoreOtpValidation,
                    false.ToString(),
                    scopes: SettingScopes.Application | SettingScopes.Tenant
                ),

                new SettingDefinition(
                    OtpSettingsNames.DefaultSubjectTemplate,
                    DefaultSubjectTemplate,
                    scopes: SettingScopes.Application | SettingScopes.Tenant
                ),

                new SettingDefinition(
                    OtpSettingsNames.DefaultBodyTemplate,
                    DefaultBodyTemplate,
                    scopes: SettingScopes.Application | SettingScopes.Tenant
                ),

                new SettingDefinition(
                    OtpSettingsNames.DefaultEmailSubjectTemplate,
                    DefaultEmailSubjectTemplate,
                    scopes: SettingScopes.Application | SettingScopes.Tenant
                ),

                new SettingDefinition(
                    OtpSettingsNames.DefaultEmailBodyTemplate,
                    DefaultEmailBodyTemplate,
                    scopes: SettingScopes.Application | SettingScopes.Tenant
                )
            };
        }
    }
}
