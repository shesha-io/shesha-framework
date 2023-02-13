using System.Threading.Tasks;

namespace Shesha.Modules
{
    /// <summary>
    /// Module can implement this interface if it requires initialization of the data-driven configuraiton
    /// </summary>
    public interface IHasDataDrivenConfiguration
    {
        /// <summary>
        /// Initialize module configuration. Gets executed on every application start
        /// </summary>
        /// <returns>True if the initialization was performed and false if the initialization is not required.</returns>
        Task<bool> InitializeConfigurationAsync();
    }
}
