using Shesha.ConfigurationItems;
using Shesha.ConfigurationItems.Models;
using Shesha.Domain.ConfigurationItems;
using Shesha.Web.FormsDesigner.Domain;
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
        /// Create new version of the form
        /// </summary>
        /// <param name="form">Form configuration</param>
        /// <returns></returns>
        Task<FormConfiguration> CreateNewVersionAsync(FormConfiguration form);

        /// <summary>
        /// Update version status
        /// </summary>
        /// <param name="form">Form</param>
        /// <param name="status">New status</param>
        /// <returns></returns>
        Task UpdateStatusAsync(FormConfiguration form, ConfigurationItemVersionStatus status);

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
        /// Create new form
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        Task<FormConfiguration> CreateAsync(CreateFormConfigurationDto input);

        /// <summary>
        /// Get All forms
        /// </summary>
        /// <returns></returns>
        Task<List<FormConfiguration>> GetAllAsync();
    }
}
