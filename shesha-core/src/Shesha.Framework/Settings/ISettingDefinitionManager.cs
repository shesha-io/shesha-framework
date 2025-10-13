using JetBrains.Annotations;
using System.Collections.Generic;

namespace Shesha.Settings
{
    /// <summary>
    /// Setting definition manager
    /// </summary>
    public interface ISettingDefinitionManager
    {
        /// <summary>
        /// Get settings definition by module and name. Throws exception when definition not found
        /// </summary>
        /// <param name="moduleName">Module name</param>
        /// <param name="name">Settings name</param>
        [NotNull]
        SettingDefinition Get([NotNull] string moduleName, [NotNull] string name);

        /// <summary>
        /// Get all settings definitions
        /// </summary>
        /// <returns></returns>
        IReadOnlyList<SettingDefinition> GetAll();

        /// <summary>
        /// Add setting definition
        /// </summary>
        /// <param name="definition"></param>
        void AddDefinition(SettingDefinition definition);

        /// <summary>
        /// Get settings definition by module and name. Returns null when definition not found
        /// </summary>
        /// <param name="moduleName">Module name</param>
        /// <param name="name">Settings name</param>
        SettingDefinition GetOrNull([NotNull] string moduleName, string name);

        /// <summary>
        /// Create user setting definition
        /// </summary>
        /// <param name="module">Module name</param>
        /// <param name="name">Setting name</param>
        /// <param name="dataType">Data type</param>
        /// <param name="value">Value</param>
        /// <returns></returns>
        SettingDefinition CreateUserSettingDefinition(string module, string name, string dataType, object? value);
    }
}
