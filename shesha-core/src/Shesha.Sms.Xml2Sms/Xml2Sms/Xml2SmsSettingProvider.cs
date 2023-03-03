using Abp.Dependency;
using Shesha.Settings;

namespace Shesha.Sms.Xml2Sms
{
    /// <summary>
    /// Defines Xml2Sms gateway settings.
    /// </summary>
    public class Xml2SmsSettingProvider : SettingDefinitionProvider, ITransientDependency
    {
        private const string CategoryName = "Xml 2 SMS";

        public override void Define(ISettingDefinitionContext context)
        {
            context.Add(
                new SettingDefinition<string>(Xml2SmsSettingNames.Host, "", "Xml2Smsl Host") { Category = CategoryName },
                new SettingDefinition<string>(Xml2SmsSettingNames.ApiUsername, "Api Username") { Category = CategoryName },
                new SettingDefinition<string>(Xml2SmsSettingNames.ApiPassword, "Api Password") { Category = CategoryName },

                new SettingDefinition<bool>(
                    Xml2SmsSettingNames.UseProxy,
                    false,
                    "Use Proxy")
                { Category = CategoryName },
                new SettingDefinition<bool>(
                    Xml2SmsSettingNames.UseDefaultProxyCredentials,
                    true,
                    "Use default proxy credentials")
                { Category = CategoryName },
                new SettingDefinition<string>(
                    Xml2SmsSettingNames.WebProxyAddress,
                    null,
                    "Web Proxy Address")
                { Category = CategoryName },
                new SettingDefinition<string>(
                    Xml2SmsSettingNames.WebProxyUsername,
                    null,
                    "Proxy Login")
                { Category = CategoryName },
                new SettingDefinition<string>(
                    Xml2SmsSettingNames.WebProxyPassword,
                    null,
                    "Proxy Password")
                { Category = CategoryName }
            );
        }
    }
}
