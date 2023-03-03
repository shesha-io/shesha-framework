using Abp.Dependency;
using Shesha.Settings;

namespace Shesha.AzureAD.Configuration
{
    /// <summary>
    /// Defines AzureAD settings.
    /// </summary>
    public class AzureADSettingProvider : SettingDefinitionProvider, ITransientDependency
    {
        private const string CategoryName = "Azure AD";

        public override void Define(ISettingDefinitionContext context)
        {
            context.Add(
                new SettingDefinition<bool>(
                    AzureADSettingNames.IsEnabled,
                    false,
                    "Is Enabled"
                )
                { Category = CategoryName },
                new SettingDefinition<string>(
                    AzureADSettingNames.InstanceUrl,
                    null,
                    "Instance Url"
                )
                { Category = CategoryName },
                new SettingDefinition<string>(
                    AzureADSettingNames.Tenant,
                    null,
                    "Tenant"
                )
                { Category = CategoryName },
                new SettingDefinition<string>(
                    AzureADSettingNames.AppIdUri,
                    null,
                    "App Id Uri"
                )
                { Category = CategoryName },
                new SettingDefinition<string>(
                    AzureADSettingNames.ClientApplicationId,
                    null,
                    "Client Application Id"
                )
                { Category = CategoryName }
            );
        }
    }
}
