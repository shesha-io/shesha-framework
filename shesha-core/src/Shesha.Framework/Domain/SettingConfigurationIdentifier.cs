namespace Shesha.Domain
{
    /// <summary>
    /// Setting configuration identifier
    /// </summary>
    public class SettingConfigurationIdentifier : ConfigurationItemIdentifier<SettingConfiguration>, IIdentifierFactory<SettingConfigurationIdentifier>
    {
        public SettingConfigurationIdentifier(string? module, string name) : base(module, name)
        {
        }

        public static SettingConfigurationIdentifier New(string? module, string name)
        {
            return new SettingConfigurationIdentifier(module, name);
        }
    }    
}