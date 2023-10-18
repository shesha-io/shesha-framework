using Shesha.EntityReferences;
using System;
using System.ComponentModel;

namespace Shesha.Domain
{
    /// <summary>
    /// Setting configuration identifier
    /// </summary>
    public class SettingConfigurationIdentifier : ConfigurationItemIdentifier
    {
        public SettingConfigurationIdentifier(string module, string name) : base(module, name)
        {
        }

        public override string ItemType => "setting-config";
    }    
}