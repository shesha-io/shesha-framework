using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.Extensions;
using Abp.Runtime.Validation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Shesha.Application.Services.Dto;
using Shesha.Attributes;
using Shesha.AutoMapper.Dto;
using Shesha.Configuration.Runtime;
using Shesha.ConfigurationItems;
using Shesha.ConfigurationItems.Cache;
using Shesha.ConfigurationItems.Models;
using Shesha.Domain.ConfigurationItems;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities;
using Shesha.Exceptions;
using Shesha.Extensions;
using Shesha.Mvc;
using Shesha.Permissions;
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
        private readonly IEntityConfigManager _entityConfigManager;
        private readonly IPermissionedObjectManager _permissionedObjectManager;

        public FormConfigurationAppService(
            IRepository<FormConfiguration, Guid> repository,
            IRepository<Module, Guid> moduleRepository,
            IFormManager formManager,
            IConfigurationFrameworkRuntime cfRuntime,
            IConfigurationItemClientSideCache clientSideCache,
            IEntityConfigManager entityConfigManager,
            IPermissionedObjectManager permissionedObjectManager
        ) : base(repository)
        {
            _moduleRepository = moduleRepository;
            _formManager = formManager;
            _cfRuntime = cfRuntime;
            _clientSideCache = clientSideCache;
            _entityConfigManager = entityConfigManager;
            _permissionedObjectManager = permissionedObjectManager;
        }

        private async Task<string[]> GetFormPermissionsAsync(string module, string name)
        {
            var permission = await _permissionedObjectManager.GetOrDefaultAsync(
                FormManager.GetFormPermissionedObjectName(module, name),
                ShaPermissionedObjectsTypes.Form
            );
            return permission?.Access == RefListPermissionedAccess.RequiresPermissions
                ? permission.Permissions?.ToArray() ?? []
                : [];
        }

        /// <summary>
        /// Gets all permissioned shesha forms with anonymous access
        /// </summary>
        /// <returns></returns>
        public async Task<List<PermissionedObjectDto>> GetAnonymousFormsAsync()
        {
            return await _permissionedObjectManager.GetObjectsByAccessAsync(ShaPermissionedObjectsTypes.Form, RefListPermissionedAccess.AllowAnonymous);
        }

        private async Task<bool> CheckFormPermissionsAsync(string module, string name)
        {
            var permission = await _permissionedObjectManager.GetOrDefaultAsync(
                FormManager.GetFormPermissionedObjectName(module, name),
                ShaPermissionedObjectsTypes.Form
            );

            var access = permission?.Access == null || permission.Access < RefListPermissionedAccess.AnyAuthenticated
                ? RefListPermissionedAccess.AnyAuthenticated
                : permission.Access;
            if (AbpSession.UserId == null
                && (access == RefListPermissionedAccess.AnyAuthenticated || access == RefListPermissionedAccess.RequiresPermissions))
                throw new AbpAuthorizationException("You are not authorized for this form");
            if (access == RefListPermissionedAccess.RequiresPermissions)
            {
                var permissions = permission.Permissions.ToArray() ?? [];
                return await PermissionChecker.IsGrantedAsync(false, permissions);
            }
            return true;
        }

        protected override FormConfigurationDto MapToEntityDto(FormConfiguration entity)
        {
            return AsyncHelper.RunSync(() => MapToEntityDtoAsync(entity));
        }
        
        protected async Task<FormConfigurationDto> MapToEntityDtoAsync(FormConfiguration entity)
        {
            var dto = base.MapToEntityDto(entity);

            var permission = await _permissionedObjectManager.GetOrNullAsync(
                FormManager.GetFormPermissionedObjectName(entity.Module?.Name, entity.Name),
                ShaPermissionedObjectsTypes.Form
            );
            if (permission?.Access > RefListPermissionedAccess.Inherited) // Check if permission exists
            {
                dto.Access = permission?.Access;
                dto.Permissions = permission?.Permissions;
            }
            return dto;
        }

        /// <summary>
        /// Check permission of forms configuration by name
        /// </summary>
        /// <returns></returns>
        /// <exception cref="FormNotFoundException"></exception>
        [HttpPost]
        [AllowAnonymous]
        public async Task<List<FormByFullNamePermissionsDto>> CheckPermissionsAsync(GetFormByFullNameInput[] input)
        {
            var result = new List<FormByFullNamePermissionsDto>();

            foreach (var inputItem in input)
            {
                var permissions = await GetFormPermissionsAsync(inputItem.Module, inputItem.Name);
                if (permissions.Length > 0)
                    result.Add(new FormByFullNamePermissionsDto
                    {
                        Name = inputItem.Name,
                        Module = inputItem.Module,
                        Permissions = permissions,
                    });
            }

            return result;
        }


        /// <summary>
        /// Get current form configuration by name
        /// </summary>
        /// <returns></returns>
        /// <exception cref="FormNotFoundException"></exception>
        [HttpGet]
        [AllowAnonymous]
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
            var query = Repository.GetAll().Where(f => f.Module == moduleEntity &&
                f.Name == input.Name);

            if (input.Version.HasValue)
                query = query.Where(f => f.VersionNo == input.Version.Value);
            else {
                switch (mode)
                {
                    case ConfigurationItems.Models.ConfigurationItemViewMode.Live:
                        query = query.Where(f => f.VersionStatus == ConfigurationItemVersionStatus.Live);
                        break;
                    case ConfigurationItems.Models.ConfigurationItemViewMode.Ready:
                        {
                            var statuses = new ConfigurationItemVersionStatus[] {
                            ConfigurationItemVersionStatus.Live,
                            ConfigurationItemVersionStatus.Ready
                        };

                            query = query.Where(f => statuses.Contains(f.VersionStatus)).OrderByDescending(f => f.VersionNo);
                            break;
                        }
                    case ConfigurationItems.Models.ConfigurationItemViewMode.Latest:
                        {
                            var statuses = new ConfigurationItemVersionStatus[] {
                            ConfigurationItemVersionStatus.Live,
                            ConfigurationItemVersionStatus.Ready,
                            ConfigurationItemVersionStatus.Draft
                        };
                            query = query.Where(f => f.IsLast && statuses.Contains(f.VersionStatus));
                            break;
                        }
                }
            }

            var form = await AsyncQueryableExecuter.FirstOrDefaultAsync(query);

            if (form == null)
                throw new FormNotFoundException(input.Module, input.Name);

            var dto = await MapToEntityDtoAsync(form);

            dto.CacheMd5 = GetMd5(dto);
            await _clientSideCache.SetCachedMd5Async(FormConfiguration.ItemTypeName, null, input.Module, input.Name, mode, dto.CacheMd5);

            if (!await CheckFormPermissionsAsync(form.Module?.Name, form.Name))
            {
                dto.Markup = null;
                dto.CacheMd5 = "";
            }

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

            var form = await Repository.GetAsync(input.Id);

            var dto = await MapToEntityDtoAsync(form);
            dto.CacheMd5 = GetMd5(dto);

            // add MD5 to request
            await _clientSideCache.SetCachedMd5Async(FormConfiguration.ItemTypeName, input.Id, dto.CacheMd5);

            if (!await CheckFormPermissionsAsync(form.Module?.Name, form.Name))
            {
                dto.Markup = null;
                dto.CacheMd5 = "";
            }

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

            if (input.Access > RefListPermissionedAccess.Inherited)
            {
                var permisson = new PermissionedObjectDto
                {
                    Object = FormManager.GetFormPermissionedObjectName(form.Module?.Name, form.Name),
                    Name = $"{form.Module?.Name}.{form.Name}",
                    Module = form.Module.Name,
                    ModuleId = form.Module.Id,
                    Type = ShaPermissionedObjectsTypes.Form,
                    Access = input.Access,
                    Permissions = input.Permissions,
                };

                await _permissionedObjectManager.SetAsync(permisson);
            }
        }

        /// <summary>
        /// Update form status
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        [HttpPut]
        public async Task UpdateStatusAsync(UpdateConfigurationStatusInput input)
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
        /// Publish All forms
        /// </summary>
        /// <returns></returns>
        [HttpPut]
        public async Task PublishAllAsync()
        {
            CheckCreatePermission();

            var forms = await _formManager.GetAllAsync();

            var draftOrReadyForms = forms
                .Where(x => x.VersionStatus == ConfigurationItemVersionStatus.Draft || x.VersionStatus == ConfigurationItemVersionStatus.Ready)
                .ToList();

            // Update the status of each form to Live
            foreach (var form in draftOrReadyForms)
            {
                await _formManager.UpdateStatusAsync(form, ConfigurationItemVersionStatus.Live);
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

            return await MapToEntityDtoAsync(form);
        }

        /// <summary>
        /// Create new version of form configuration
        /// </summary>
        /// <exception cref="AbpValidationException"></exception>
        [HttpPost]
        public async Task<FormConfigurationDto> CreateNewVersionAsync(CreateNewVersionInput input) 
        {
            CheckCreatePermission();

            var item = await Repository.GetAsync(input.Id);

            var validationResults = new List<ValidationResult>();

            if (item.VersionStatus != ConfigurationItemVersionStatus.Live &&
                item.VersionStatus != ConfigurationItemVersionStatus.Cancelled)
                validationResults.Add(new ValidationResult($"Creation of new version allowed only for items with '{ConfigurationItemVersionStatus.Live}' or '{ConfigurationItemVersionStatus.Cancelled}' status"));

            if (!item.IsLast)
                validationResults.Add(new ValidationResult($"Creation of new version allowed only for last version of form"));

            if (validationResults.Any())
                throw new AbpValidationException("Failed to create new version", validationResults);

            var newVersion = await _formManager.CreateNewVersionAsync(item);
            await CurrentUnitOfWork.SaveChangesAsync();

            return await MapToEntityDtoAsync(newVersion);
        }

        /// <summary>
        /// Cancel version
        /// </summary>
        /// <exception cref="AbpValidationException"></exception>
        [HttpPost]
        public async Task<FormConfigurationDto> CancelVersionAsync(CancelVersionInput input)
        {
            CheckCreatePermission();

            var item = await Repository.GetAsync(input.Id);

            var validationResults = new List<ValidationResult>();

            if (item.VersionStatus != ConfigurationItemVersionStatus.Ready)
                validationResults.Add(new ValidationResult($"This operation is allowed only for items with '{ConfigurationItemVersionStatus.Ready}' status"));

            if (!item.IsLast)
                validationResults.Add(new ValidationResult($"This operation is allowed only for last version of form"));

            if (validationResults.Any())
                throw new AbpValidationException("Failed to cancel version", validationResults);

            await _formManager.CancelVersoinAsync(item);
            await CurrentUnitOfWork.SaveChangesAsync();

            return await MapToEntityDtoAsync(item);
        }

        /// <summary>
        /// Get form in JSON format
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet]
        public async Task<FileContentResult> GetJsonAsync(Guid id)
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
        public async Task<FormConfigurationDto> ImportJsonAsync([FromForm] ImportFormJsonInput input)
        {
            var item = await Repository.GetAsync(input.ItemId);
            
            var validationResults = new List<ValidationResult>();
            if (item.VersionStatus != ConfigurationItemVersionStatus.Draft)
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

            return await MapToEntityDtoAsync(item);
        }

        /// <summary>
        /// Update form configuration
        /// </summary>
        public override async Task<FormConfigurationDto> UpdateAsync(UpdateFormConfigurationDto input)
        {
            CheckUpdatePermission();

            var validationResults = new List<ValidationResult>();

            var alreadyExist = await Repository.GetAll().Where(f => f.Id != input.Id && f.Module.Name == input.ModelType && f.Name == input.Name).AnyAsync();
            if (alreadyExist)
                validationResults.Add(new ValidationResult(
                    input.ModelType != null
                        ? $"Form with name `{input.Name}` already exists in module `{input.ModelType}`"
                        : $"Form with name `{input.Name}` already exists"
                    )
                );

            if (validationResults.Any())
                throw new AbpValidationException("Please correct the errors and try again", validationResults);

            var entity = await GetEntityByIdAsync(input.Id);

            entity.Name = input.Name;
            entity.Label = input.Label;
            entity.Description = input.Description;
            entity.Markup = input.Markup;
            entity.ModelType = input.ModelType;

            await CurrentUnitOfWork.SaveChangesAsync();

            return await MapToEntityDtoAsync(entity);
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

            return await MapToEntityDtoAsync(form);
        }

        [HttpGet]
        public async Task<List<AutocompleteItemDto>> AutocompleteAsync(string term, string selectedValue)
        {
            var isPreselection = string.IsNullOrWhiteSpace(term) && !string.IsNullOrWhiteSpace(selectedValue);
            var models = (await AsyncQueryableExecuter.ToListAsync(
                Repository.GetAll().Select(x => new { Name = x.Name, Module = x.Module.Name }))
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

        public async Task<List<object>> GetFormsWithNotImplementedAsync()
        {
            var configs = (await _entityConfigManager.GetMainDataListAsync()).Where(x => x.NotImplemented).ToList();
            var list = new List<object>();

            var forms = Repository.GetAll().Where(x =>
                    (int)x.VersionStatus < 4
                    && !x.Name.Contains(".json")
                    && x.Markup != null)
                .Select(x => new { x.FullName, x.VersionNo, x.VersionStatus, x.Markup })
                .ToList();

            foreach (var config in configs)
            {
                var className = $"\"{config.FullClassName}\"";
                var typeShortAlias = $"\"{config.TypeShortAlias}\"";
                var usetsa = !config.TypeShortAlias.IsNullOrWhiteSpace();
                var formConfigs = forms.Where(x =>/*usetsa && x.Markup.Contains(typeShortAlias) ||*/ x.Markup.Contains(className)).ToList();

                list.AddRange(formConfigs.Select(x => {
                    return new
                    {
                        className,
                        typeShortAlias,
                        x.FullName,
                        x.VersionNo,
                        x.VersionStatus
                    };
                }).ToList());
            }
            return list;
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

        public async Task ExportAllAsync(ExportAllInput input) 
        {
            if (!Directory.Exists(input.Path))
                Directory.CreateDirectory(input.Path);

            var forms = await Repository.GetAll()
                .Select(f => new
            {
                Name = f.Name,
                Version = f.VersionNo,
                Markup = f.Markup,
                Module = f.Module != null ? f.Module.Name : "[no-module]"
            }).ToListAsync();

            foreach (var form in forms)
            {
                if (!string.IsNullOrWhiteSpace(form.Markup)) 
                {
                    try
                    {
                        var fileName = Path.Combine(input.Path, form.Module, $"{form.Name}.v{form.Version}.json".RemovePathIllegalCharacters());
                        var directory = Path.GetDirectoryName(fileName);
                        if (!Directory.Exists(directory))
                            Directory.CreateDirectory(directory);

                        await File.WriteAllTextAsync(fileName, form.Markup);
                    }
                    catch (Exception e) {
                        e.LogError();
                    }
                }
            }
        }

        [EntityAction(StandardEntityActions.List)]
        public override async Task<PagedResultDto<FormConfigurationDto>> GetAllAsync(FilteredPagedAndSortedResultRequestDto input)
        {
            CheckGetAllPermission();

            var query = CreateFilteredQuery(input);

            var totalCount = await AsyncQueryableExecuter.CountAsync(query);

            query = ApplySorting(query, input);
            query = ApplyPaging(query, input);

            var entities = await AsyncQueryableExecuter.ToListAsync(query);

            var dtos = new List<FormConfigurationDto>();
            foreach (var entity in entities) {
                var dto = await MapToEntityDtoAsync(entity);
                dtos.Add(dto);
            }

            return new PagedResultDto<FormConfigurationDto>(
                totalCount,
                dtos
            );
        }

        public class ExportAllInput 
        { 
            public string Path { get; set; }
        }
    }
}