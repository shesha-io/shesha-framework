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
        /// Create new setting definition
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        Task<SettingConfiguration> CreateSettingDefinitionAsync(CreateSettingDefinitionDto input);

        /// <summary>
        /// Get setting definition
        /// </summary>
        Task<SettingConfiguration> GetSettingDefinitionAsync(ConfigurationItemIdentifier id);

        /// <summary>
        /// Get stored setting value
        /// </summary>
        /// <param name="setting">Setting definition</param>
        /// <param name="context">Setting context</param>
        /// <returns></returns>
        Task<SettingValue> GetSettingValueAsync(SettingDefinition setting, SettingManagementContext context);
    }
}
