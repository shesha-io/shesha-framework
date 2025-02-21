namespace Shesha.Domain
{
    /// <summary>
    /// Setting configuration identifier
    /// </summary>
    public class SettingConfigurationIdentifier : ConfigurationItemIdentifier<SettingConfiguration>
    {
        public SettingConfigurationIdentifier(string module, string name) : base(module, name)
        {
        }
    }    
}