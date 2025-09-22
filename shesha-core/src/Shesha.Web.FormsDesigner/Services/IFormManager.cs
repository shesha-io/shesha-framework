using Shesha.ConfigurationItems;
using Shesha.Domain;
using Shesha.Web.FormsDesigner.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.Web.FormsDesigner.Services
{
    /// <summary>
    /// Form manager
    /// </summary>
    public interface IFormManager: IConfigurationItemManager
    {
        /// <summary>
        /// Get All forms
        /// </summary>
        /// <returns></returns>
        Task<List<FormConfiguration>> GetAllAsync();

        /// <summary>
        /// Create form item with form-specific input
        /// </summary>
        Task<FormConfiguration> CreateFormAsync(CreateFormInput input);
    }
}