using JetBrains.Annotations;
using System.Collections.Generic;

namespace Shesha.Settings
{
    /// <summary>
    /// Setting definition manager
    /// </summary>
    public interface ISettingDefinitionManager
    {
        [NotNull]
        SettingDefinition Get([NotNull] string moduleName, [NotNull] string name);

        IReadOnlyList<SettingDefinition> GetAll();

        void AddDefinition(SettingDefinition definition);

        SettingDefinition GetOrNull([NotNull] string moduleName, string name);

        SettingDefinition<T> CreateUserSettingDefinition<T>(string name, T defaultValue, string module);
    }
}
