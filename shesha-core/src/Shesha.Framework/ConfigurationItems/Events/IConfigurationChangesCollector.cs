using Shesha.Domain;

namespace Shesha.ConfigurationItems.Events
{
    /// <summary>
    /// Configuration Item changes collector. Collects configurtation changes and triggers auto generation of revisions
    /// </summary>
    public interface IConfigurationChangesCollector
    {
        /// <summary>
        /// Add configuration change
        /// </summary>
        void AddUpdate(ConfigurationItemIdentifier identifier);

        /// <summary>
        /// Add configuration change
        /// </summary>
        void AddUpdate(string itemType, string module, string name);

        /// <summary>
        /// Add configuration change
        /// </summary>
        void AddUpdate(ConfigurationItem configurationItem);

        /// <summary>
        /// Try add configuration change. Is used for simplification purposes. It calls <see cref="AddUpdate(ConfigurationItem)"/> when <see cref="ConfigurationItem"/> is not null.
        /// </summary>
        /// <param name="configurationItem"></param>
        void TryAddUpdate(ConfigurationItem? configurationItem);
    }
}
