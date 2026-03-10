using Shesha.ConfigurationItems;
using Shesha.Domain;
using Shesha.Services.Settings.Dto;
using Shesha.Settings;
using System.Threading.Tasks;

namespace Shesha.Services.Settings
{
    /// <summary>
    /// Settings store
    /// </summary>
    public interface ISettingStore: IConfigurationItemManager<SettingConfiguration>
    {
        /// <summary>
        /// Create new setting configuration
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        Task<SettingConfiguration> CreateSettingConfigurationAsync(CreateSettingDefinitionDto input);

        /// <summary>
        /// Get setting configuration
        /// </summary>
        Task<SettingConfiguration> GetSettingConfigurationAsync(ConfigurationItemIdentifier id);

        /// <summary>
        /// Get stored setting value
        /// </summary>
        /// <param name="setting">Setting definition</param>
        /// <param name="context">Setting context</param>
        /// <returns></returns>
        Task<SettingValue?> GetSettingValueAsync(SettingDefinition setting, SettingManagementContext context);

        /// <summary>
        /// Get setting value
        /// </summary>
        /// <param name="setting">Setting definition</param>
        /// <param name="context">Setting context</param>
        /// <returns></returns>
        Task<string?> GetValueAsync(SettingDefinition setting, SettingManagementContext context);
    }
}
