using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using Abp.Runtime.Validation;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Shesha.Application.Services.Dto;
using Shesha.AutoMapper.Dto;
using Shesha.ConfigurationItems;
using Shesha.ConfigurationItems.Cache;
using Shesha.ConfigurationItems.Models;
using Shesha.Domain.ConfigurationItems;
using Shesha.Exceptions;
using Shesha.Mvc;
using Shesha.Utilities;
using Shesha.Web.FormsDesigner.Domain;
using Shesha.Web.FormsDesigner.Dtos;
using Shesha.Web.FormsDesigner.Exceptions;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Web.FormsDesigner.Services
{
    public class FormConfigurationAppService : SheshaCrudServiceBase<FormConfiguration, FormConfigurationDto, Guid, FilteredPagedAndSortedResultRequestDto, CreateFormConfigurationDto, UpdateFormConfigurationDto, GetFormByIdInput>
    {
        public const string MovePermissionName = "";
        public const string CopyPermissionName = "";

        private readonly IRepository<Module, Guid> _moduleRepository;
        private readonly IFormManager _formManager;
        private readonly IConfigurationFrameworkRuntime _cfRuntime;
        private readonly IConfigurationItemClientSideCache _clientSideCache;
        

        public FormConfigurationAppService(IRepository<FormConfiguration, Guid> repository, IRepository<Module, Guid> moduleRepository, IFormManager formManager, IConfigurationFrameworkRuntime cfRuntime, IConfigurationItemClientSideCache clientSideCache) : base(repository)
        {
            _moduleRepository = moduleRepository;
            _formManager = formManager;
            _cfRuntime = cfRuntime;
            _clientSideCache = clientSideCache;
        }

        /// <summary>
        /// Get current form configuration by name
        /// </summary>
        /// <returns></returns>
        /// <exception cref="FormNotFoundException"></exception>
        [HttpGet]
        public async Task<FormConfigurationDto> GetByNameAsync(GetFormByFullNameInput input)
        {
            var mode = _cfRuntime.ViewMode;

            // check cache
            if (!string.IsNullOrWhiteSpace(input.Md5)) 
            {
                var cachedMd5 = await _clientSideCache.GetCachedMd5Async(FormConfiguration.ItemTypeName, null, input.Module, input.Name, mode);
                if (input.Md5 == cachedMd5)
                    throw new ContentNotModifiedException("Form not changed");
            }

            var moduleEntity = await GetModuleAsync(input.Module);

            // todo: move to a generic method
            var query = Repository.GetAll().Where(f => f.Configuration.Module == moduleEntity &&
                f.Configuration.Name == input.Name);

            if (input.Version.HasValue)
                query = query.Where(f => f.Configuration.VersionNo == input.Version.Value);
            else {
                switch (mode) 
                {
                    case ConfigurationItems.Models.ConfigurationItemViewMode.Live:
                        query = query.Where(f => f.Configuration.VersionStatus == ConfigurationItemVersionStatus.Live);
                        break;
                    case ConfigurationItems.Models.ConfigurationItemViewMode.Ready:
                    {
                        var statuses = new ConfigurationItemVersionStatus[] { 
                            ConfigurationItemVersionStatus.Live, 
                            ConfigurationItemVersionStatus.Ready 
                        };

                        query = query.Where(f => statuses.Contains(f.Configuration.VersionStatus)).OrderByDescending(f => f.Configuration.VersionNo);
                        break;
                    }
                    case ConfigurationItems.Models.ConfigurationItemViewMode.Latest:
                    {
                        var statuses = new ConfigurationItemVersionStatus[] { 
                            ConfigurationItemVersionStatus.Live, 
                            ConfigurationItemVersionStatus.Ready,
                            ConfigurationItemVersionStatus.Draft
                        };
                        query = query.Where(f => f.Configuration.IsLast && statuses.Contains(f.Configuration.VersionStatus));
                        break;
                    }
                }
            }

            var form = await AsyncQueryableExecuter.FirstOrDefaultAsync(query);
            
            if (form == null)
                throw new FormNotFoundException(input.Module, input.Name);

            var dto = ObjectMapper.Map<FormConfigurationDto>(form);

            var json = JsonConvert.SerializeObject(dto);
            dto.CacheMd5 = GetMd5(dto);
            await _clientSideCache.SetCachedMd5Async(FormConfiguration.ItemTypeName, null, input.Module, input.Name, mode, dto.CacheMd5);

            return dto;
        }

        public override async Task<FormConfigurationDto> GetAsync(GetFormByIdInput input)
        {
            // check cache
            if (!string.IsNullOrWhiteSpace(input.Md5))
            {
                var cachedMd5 = await _clientSideCache.GetCachedMd5Async(FormConfiguration.ItemTypeName, input.Id);
                if (input.Md5 == cachedMd5)
                    throw new ContentNotModifiedException("Form not changed");
            }

            // add MD5 to request
            var dto = await base.GetAsync(input);

            dto.CacheMd5 = GetMd5(dto);
            await _clientSideCache.SetCachedMd5Async(FormConfiguration.ItemTypeName, input.Id, dto.CacheMd5);

            return dto;
        }

        private string GetMd5(FormConfigurationDto dto) 
        {
            var json = JsonConvert.SerializeObject(dto);
            return json.ToMd5Fingerprint();
        }

        /// <summary>
        /// Update form markup
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        [HttpPut]
        public async Task UpdateMarkupAsync(FormUpdateMarkupInput input) 
        {
            // todo: check rights
            var form = await Repository.GetAsync(input.Id);
            form.Markup = input.Markup;
            await Repository.UpdateAsync(form);
        }

        /// <summary>
        /// Update form status
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        [HttpPut]
        public async Task UpdateStatus(UpdateConfigurationStatusInput input)
        {
            // todo: check rights
            
            var validationResults = new List<ValidationResult>();
            if (string.IsNullOrWhiteSpace(input.Filter))
                validationResults.Add(new ValidationResult("Filter is mandatory", new string[] { nameof(input.Filter) }));
            if (validationResults.Any())
                throw new AbpValidationException("Please correct the errors and try again", validationResults);

            var forms = await GetAllFiltered(input.Filter);

            foreach (var form in forms)
            {
                await _formManager.UpdateStatusAsync(form, input.Status);
            }
        }

        /// <summary>
        /// Create new form configuration
        /// </summary>
        public override async Task<FormConfigurationDto> CreateAsync(CreateFormConfigurationDto input)
        {
            CheckCreatePermission();

            var form = await _formManager.CreateAsync(input);

            await CurrentUnitOfWork.SaveChangesAsync();

            return MapToEntityDto(form);
        }

        /// <summary>
        /// Create new version of form configuration
        /// </summary>
        /// <exception cref="AbpValidationException"></exception>
        [HttpPost]
        public async Task<FormConfigurationDto> CreateNewVersion(CreateNewVersionInput input) 
        {
            CheckCreatePermission();

            var item = await Repository.GetAsync(input.Id);

            var validationResults = new List<ValidationResult>();

            if (item.Configuration.VersionStatus != ConfigurationItemVersionStatus.Live &&
                item.Configuration.VersionStatus != ConfigurationItemVersionStatus.Cancelled)
                validationResults.Add(new ValidationResult($"Creation of new version allowed only for items with '{ConfigurationItemVersionStatus.Live}' or '{ConfigurationItemVersionStatus.Cancelled}' status"));

            if (!item.Configuration.IsLast)
                validationResults.Add(new ValidationResult($"Creation of new version allowed only for last version of form"));

            if (validationResults.Any())
                throw new AbpValidationException("Failed to create new version", validationResults);

            var newVersion = await _formManager.CreateNewVersionAsync(item);
            await CurrentUnitOfWork.SaveChangesAsync();

            return MapToEntityDto(newVersion);
        }

        /// <summary>
        /// Cancel version
        /// </summary>
        /// <exception cref="AbpValidationException"></exception>
        [HttpPost]
        public async Task<FormConfigurationDto> CancelVersion(CancelVersionInput input)
        {
            CheckCreatePermission();

            var item = await Repository.GetAsync(input.Id);

            var validationResults = new List<ValidationResult>();

            if (item.Configuration.VersionStatus != ConfigurationItemVersionStatus.Ready)
                validationResults.Add(new ValidationResult($"This operation is allowed only for items with '{ConfigurationItemVersionStatus.Ready}' status"));

            if (!item.Configuration.IsLast)
                validationResults.Add(new ValidationResult($"This operation is allowed only for last version of form"));

            if (validationResults.Any())
                throw new AbpValidationException("Failed to cancel version", validationResults);

            await _formManager.CancelVersoinAsync(item);
            await CurrentUnitOfWork.SaveChangesAsync();

            return MapToEntityDto(item);
        }

        /// <summary>
        /// Get form in JSON format
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet]
        public async Task<FileContentResult> GetJson(Guid id)
        {
            var item = await Repository.GetAsync(id);
            var bytes = Encoding.UTF8.GetBytes(item.Markup ?? "");
            
            return new ShaFileContentResult(bytes, "application/json") { FileDownloadName = $"{item.FullName}.json" };
        }

        /// <summary>
        /// Import JSON
        /// </summary>
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<FormConfigurationDto> ImportJson([FromForm] ImportFormJsonInput input)
        {
            var item = await Repository.GetAsync(input.ItemId);
            
            var validationResults = new List<ValidationResult>();
            if (item.Configuration.VersionStatus != ConfigurationItemVersionStatus.Draft)
                validationResults.Add(new ValidationResult($"Import JSON is allowed for Draft version only"));

            if (input.File == null || input.File.Length == 0)
                validationResults.Add(new ValidationResult($"Please upload JSON file"));
            else {
                var extension = Path.GetExtension(input.File.FileName)?.ToLower();
                if (extension != ".json")
                    validationResults.Add(new ValidationResult($"Import supports only json files"));                 
            }

            if (validationResults.Any())
                throw new AbpValidationException("Failed to import JSON", validationResults);

            using (var fileStream = input.File.OpenReadStream()) 
            {
                using (var reader = new StreamReader(fileStream)) 
                {
                    item.Markup = await reader.ReadToEndAsync();
                    await Repository.UpdateAsync(item);
                }
            }
            await CurrentUnitOfWork.SaveChangesAsync();

            return MapToEntityDto(item);
        }

        /// <summary>
        /// Update form configuration
        /// </summary>
        public override async Task<FormConfigurationDto> UpdateAsync(UpdateFormConfigurationDto input)
        {
            CheckUpdatePermission();

            var entity = await GetEntityByIdAsync(input.Id);

            entity.Configuration.Label = input.Label;
            entity.Configuration.Description = input.Description;
            entity.Markup = input.Markup;
            entity.ModelType = input.ModelType;

            await CurrentUnitOfWork.SaveChangesAsync();

            return MapToEntityDto(entity);
        }

        /// <summary>
        /// Delete form
        /// </summary>
        public override async Task DeleteAsync(EntityDto<Guid> input)
        {
            CheckDeletePermission();

            await _formManager.DeleteAllVersionsAsync(input.Id);
        }

        /// <summary>
        /// Move form to another module
        /// </summary>
        [HttpPost]
        public async Task MoveToModuleAsync(MoveToModuleInput input)
        {
            CheckPermission(MovePermissionName);

            await _formManager.MoveToModuleAsync(input);
        }

        /// <summary>
        /// Copy form
        /// </summary>
        [HttpPost]
        public async Task<FormConfigurationDto> CopyAsync(CopyItemInput input)
        {
            CheckPermission(CopyPermissionName);

            var form = await _formManager.CopyAsync(input);

            await CurrentUnitOfWork.SaveChangesAsync();

            return MapToEntityDto(form);
        }

        [HttpGet]
        public async Task<List<AutocompleteItemDto>> AutocompleteAsync(string term, string selectedValue)
        {
            var isPreselection = string.IsNullOrWhiteSpace(term) && !string.IsNullOrWhiteSpace(selectedValue);
            var models = (await AsyncQueryableExecuter.ToListAsync(
                Repository.GetAll().Select(x => new { Name = x.Configuration.Name, Module = x.Configuration.Module.Name }))
                ).Distinct();

            var formIdJson = (string name, string module) => { return $"{{\"name\":\"{name}\",\"module\":\"{module}\"}}"; };

            var entities = isPreselection
                ? models.Where(e => formIdJson(e.Name, e.Module) == selectedValue).ToList()
                : models
                .Where(e => 
                    !string.IsNullOrWhiteSpace(e.Name) &&
                    (string.IsNullOrWhiteSpace(term)
                    || (e.Name ?? "").Contains(term, StringComparison.InvariantCultureIgnoreCase)
                    || (e.Module ?? "").Contains(term, StringComparison.InvariantCultureIgnoreCase))
                )
                .OrderBy(e => $"{e.Module}.{e.Name}")
                .Take(10)
                .ToList();

            var result = entities
                .Select(e => new AutocompleteItemDto
                {
                    DisplayText = $"{e.Module}.{e.Name}",
                    Value = formIdJson(e.Name, e.Module)
                })
                .ToList();

            return result;
        }

        #region private methods

        /// <summary>
        /// Ger module by name
        /// </summary>
        /// <param name="moduleName"></param>
        /// <returns></returns>
        private async Task<Module> GetModuleAsync(string moduleName) 
        {
            return !string.IsNullOrWhiteSpace(moduleName)
                ? await AsyncQueryableExecuter.FirstOrDefaultAsync(_moduleRepository.GetAll().Where(m => m.Name == moduleName))
                : null;
        }

        #endregion
    }
}