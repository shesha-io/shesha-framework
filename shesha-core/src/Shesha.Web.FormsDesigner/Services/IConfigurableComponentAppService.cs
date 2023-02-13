using Shesha.Web.FormsDesigner.Dtos;
using System.Threading.Tasks;

namespace Shesha.Web.FormsDesigner.Services
{
    /// <summary>
    /// Configurable component application service
    /// </summary>
    public interface IConfigurableComponentAppService
    {
        /// <summary>
        /// Get component
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        Task<ConfigurableComponentDto> GetByNameAsync(GetConfigurableComponentByNameInput input);

        /// <summary>
        /// Update component settings
        /// </summary>
        /// <returns></returns>
        Task UpdateSettingsAsync(ConfigurableComponentUpdateSettingsInput input);
    }
}
