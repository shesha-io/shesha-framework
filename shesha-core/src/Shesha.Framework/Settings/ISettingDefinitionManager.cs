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
        SettingDefinition Get([NotNull] string name);

        IReadOnlyList<SettingDefinition> GetAll();

        SettingDefinition GetOrNull(string name);
    }
}
