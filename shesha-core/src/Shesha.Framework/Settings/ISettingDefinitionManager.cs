using JetBrains.Annotations;
using System;
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

        SettingDefinition CreateUserSettingDefinition(string module, string name, string dataType, object value);
    }
}
