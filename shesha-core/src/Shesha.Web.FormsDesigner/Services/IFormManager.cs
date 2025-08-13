using Shesha.ConfigurationItems;
using Shesha.Domain;
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
    }
}