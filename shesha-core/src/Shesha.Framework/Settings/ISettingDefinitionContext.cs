using System.Collections.Generic;

namespace Shesha.Settings
{
    public interface ISettingDefinitionContext
    {
        SettingDefinition GetOrNull(string module, string name);

        Dictionary<SettingIdentifier, SettingDefinition> GetAll();

        void Add(params SettingDefinition[] definitions);
    }
}
