using Abp.Events.Bus;
using Shesha.Domain;

namespace Shesha.ConfigurationItems.Events
{
    /// <summary>
    /// Event that is raised when configuration state is updated
    /// </summary>
    public class ConfigurationStateUpdatedEventData: EventData
    {
        /// <summary>
        /// Type of configuration that was updated (form, reflist etc.)
        /// </summary>
        public string ConfigurationType { get; init; }
        
        /// <summary>
        /// Module name configuration belongs to
        /// </summary>
        public string ModuleName { get; init; }
        
        /// <summary>
        /// Configuration name
        /// </summary>
        public string ItemName { get; init; }

        public ConfigurationStateUpdatedEventData(ConfigurationItemIdentifier identifier)
        {
            ConfigurationType = identifier.ItemTypeName;
            ModuleName = identifier.Module ?? "";
            ItemName = identifier.Name;
        }

        public ConfigurationStateUpdatedEventData(string configurationType, string moduleName, string itemName) 
        {
             ConfigurationType = configurationType;
             ModuleName = moduleName;
             ItemName = itemName;
        }
    }
}
