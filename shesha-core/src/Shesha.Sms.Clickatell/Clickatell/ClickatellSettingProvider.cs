using Abp.Dependency;
using Shesha.Settings;

namespace Shesha.Sms.Clickatell
{
    /// <summary>
    /// Defines Clickatell gateway settings.
    /// </summary>
    public class ClickatellSettingProvider : SettingDefinitionProvider, ITransientDependency
    {
        private const string CategoryName = "Clickatell";

        public const int DefaultSingleMessageMaxLength = 160;
        public const int DefaultMessagePartLength = 153;

        public override void Define(ISettingDefinitionContext context)
        {
            context.Add(
                new SettingDefinition<string>(
                    ClickatellSettingNames.Host,
                    "api.clickatell.com",
                    "Clickatell Host")
                { Category = CategoryName },
                new SettingDefinition<string>(
                    ClickatellSettingNames.ApiId,
                    null,
                    "API Id")
                { Category = CategoryName },
                new SettingDefinition<string>(
                    ClickatellSettingNames.ApiUsername,
                    null,
                    "API Username")
                { Category = CategoryName },

                new SettingDefinition<string>(
                    ClickatellSettingNames.ApiPassword,
                    null,
                    "API Password")
                { Category = CategoryName },

                new SettingDefinition<bool>(
                    ClickatellSettingNames.UseProxy,
                    false,
                    "Use Proxy")
                { Category = CategoryName },
                new SettingDefinition<bool>(
                    ClickatellSettingNames.UseDefaultProxyCredentials,
                    true,
                    "Use default proxy credentials")
                { Category = CategoryName },
                new SettingDefinition<string>(
                    ClickatellSettingNames.WebProxyAddress,
                    null,
                    "Web Proxy Address")
                { Category = CategoryName },
                new SettingDefinition<string>(
                    ClickatellSettingNames.WebProxyUsername,
                    null,
                    "Proxy Login")
                { Category = CategoryName },
                new SettingDefinition<string>(
                    ClickatellSettingNames.WebProxyPassword,
                    null,
                    "Proxy Password")
                { Category = CategoryName },

                new SettingDefinition<int>(
                    ClickatellSettingNames.SingleMessageMaxLength,
                    DefaultSingleMessageMaxLength,
                    "Single message max length")
                { Category = CategoryName },

                new SettingDefinition<int>(
                    ClickatellSettingNames.MessagePartLength,
                    DefaultMessagePartLength,
                    "Message part length")
                { Category = CategoryName }
            );
        }
    }
}
