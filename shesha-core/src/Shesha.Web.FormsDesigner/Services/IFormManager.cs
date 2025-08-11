using Shesha.ConfigurationItems;
using Shesha.ConfigurationItems.Models;
using Shesha.Domain;
using Shesha.Web.FormsDesigner.Dtos;
using System;
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
        /// Delete all versions of form with specified <paramref name="id"/>
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        Task DeleteAllVersionsAsync(Guid id);

        /// <summary>
        /// Move form to another module
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        Task MoveToModuleAsync(MoveToModuleInput input);

        /// <summary>
        /// Copy form
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        Task<FormConfiguration> CopyAsync(CopyItemInput input);

        /// <summary>
        /// Get All forms
        /// </summary>
        /// <returns></returns>
        Task<List<FormConfiguration>> GetAllAsync();
    }
}
