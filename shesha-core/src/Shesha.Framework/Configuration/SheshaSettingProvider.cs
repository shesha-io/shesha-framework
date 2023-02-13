using System.Collections.Generic;
using Abp.Configuration;

namespace Shesha.Configuration
{
    public class SheshaSettingProvider : SettingProvider
    {
        public override IEnumerable<SettingDefinition> GetSettingDefinitions(SettingDefinitionProviderContext context)
        {
            return new[]
            {
                new SettingDefinition(
                    SheshaSettingNames.UploadFolder,
                    "~/App_Data/Upload"
                ),
                new SettingDefinition(
                    SheshaSettingNames.ExchangeName,
                    ""
                ),
                new SettingDefinition(
                    SheshaSettingNames.Security.AutoLogoffTimeout,
                    0.ToString()
                ),
                new SettingDefinition(
                    SheshaSettingNames.Security.ResetPasswordWithEmailLinkIsSupported,
                    false.ToString()
                ),
                new SettingDefinition(
                    SheshaSettingNames.Security.ResetPasswordWithEmailLinkExpiryDelay,
                    0.ToString()
                ),
                new SettingDefinition(
                    SheshaSettingNames.Security.ResetPasswordWithSmsOtpIsSupported,
                    false.ToString()
                ),
                new SettingDefinition(
                    SheshaSettingNames.Security.ResetPasswordWithSmsOtpExpiryDelay,
                    0.ToString()
                ),
                new SettingDefinition(
                    SheshaSettingNames.Security.ResetPasswordWithSecurityQuestionsIsSupported,
                    false.ToString()
                ),
                new SettingDefinition(
                    SheshaSettingNames.Security.ResetPasswordWithSecurityQuestionsNumQuestionsAllowed,
                    3.ToString()
                ),
            };
        }
    }
}
