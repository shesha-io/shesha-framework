using Shesha.ConfigurationItems;
using Shesha.Domain.ConfigurationItems;
using Shesha.Web.FormsDesigner.Domain;
using System.Threading.Tasks;

namespace Shesha.Web.FormsDesigner.Services
{
    /// <summary>
    /// Configurable component manager
    /// </summary>
    public interface IConfigurableComponentManager: IConfigurationItemManager
    {
        /// <summary>
        /// Create new version of the component
        /// </summary>
        /// <param name="component">Component</param>
        /// <returns></returns>
        Task<ConfigurableComponent> CreateNewVersionAsync(ConfigurableComponent component);

        /// <summary>
        /// Update version status
        /// </summary>
        /// <param name="component">Component</param>
        /// <param name="status">New status</param>
        /// <returns></returns>
        Task UpdateStatusAsync(ConfigurableComponent component, ConfigurationItemVersionStatus status);
    }
}
