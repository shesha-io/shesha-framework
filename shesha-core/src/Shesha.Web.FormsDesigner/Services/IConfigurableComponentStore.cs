using System;
using System.Threading.Tasks;
using Shesha.Web.FormsDesigner.Dtos;

namespace Shesha.Web.FormsDesigner.Services
{
    /// <summary>
    /// Interface of the form store
    /// </summary>
    public interface IConfigurableComponentStore
    {
        /// <summary>
        /// Get form by path
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        Task<ConfigurableComponentDto> GetAsync(Guid id);

        /// <summary>
        /// Get existing component or create a new one if missing
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        Task<ConfigurableComponentDto> GetOrCreateAsync(Guid id);

        /// <summary>
        /// Update form
        /// </summary>
        /// <param name="form"></param>
        /// <returns></returns>
        Task<ConfigurableComponentDto> UpdateAsync(ConfigurableComponentDto form);

        /// <summary>
        /// Create new form
        /// </summary>
        /// <param name="form"></param>
        /// <returns></returns>
        Task<ConfigurableComponentDto> CreateAsync(ConfigurableComponentDto form);
    }
}
