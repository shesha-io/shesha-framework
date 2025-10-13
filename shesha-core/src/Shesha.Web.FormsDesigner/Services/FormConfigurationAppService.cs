using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.Runtime.Validation;
using Abp.Threading;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Shesha.Application.Services.Dto;
using Shesha.Attributes;
using Shesha.ConfigurationItems.Cache;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities;
using Shesha.Exceptions;
using Shesha.Extensions;
using Shesha.Mvc;
using Shesha.Permissions;
using Shesha.Reflection;
using Shesha.Utilities;
using Shesha.Web.FormsDesigner.Dtos;
using Shesha.Web.FormsDesigner.Dtos.Forms;
using Shesha.Web.FormsDesigner.Exceptions;
using Shesha.Web.FormsDesigner.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Web.FormsDesigner.Services
{
    public class FormConfigurationAppService : SheshaCrudServiceBase<FormConfiguration, FormConfigurationDto, Guid, FilteredPagedAndSortedResultRequestDto, CreateFormConfigurationRequest, UpdateFormConfigurationDto, GetFormByIdInput>
    {
        private readonly IRepository<ConfigurationItemFolder, Guid> _folderRepository;
        private readonly IRepository<Module, Guid> _moduleRepository;
        private readonly IFormManager _formManager;
        private readonly IConfigurationItemClientSideCache _clientSideCache;
        private readonly IPermissionedObjectManager _permissionedObjectManager;

        public FormConfigurationAppService(
            IRepository<FormConfiguration, Guid> repository,
            IRepository<Module, Guid> moduleRepository,
            IRepository<ConfigurationItemFolder, Guid> folderRepository,
            IFormManager formManager,
            IConfigurationItemClientSideCache clientSideCache,
            IPermissionedObjectManager permissionedObjectManager
        ) : base(repository)
        {
            _moduleRepository = moduleRepository;
            _folderRepository = folderRepository;
            _formManager = formManager;
            _clientSideCache = clientSideCache;
            _permissionedObjectManager = permissionedObjectManager;
        }

        private async Task<string[]> GetFormPermissionsAsync(string? module, string name)
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
        public Task<List<PermissionedObjectDto>> GetAnonymousFormsAsync()
        {
            return _permissionedObjectManager.GetObjectsByAccessAsync(ShaPermissionedObjectsTypes.Form, RefListPermissionedAccess.AllowAnonymous);
        }

        private async Task<bool> CheckFormPermissionsAsync(string? module, string name)
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
                var permissions = permission?.Permissions?.ToArray() ?? [];
                return await PermissionChecker.IsGrantedAsync(false, permissions);
            }
            return true;
        }

        protected override FormConfigurationDto MapToEntityDto(FormConfiguration entity)
        {
            return AsyncHelper.RunSync(() => MapToEntityDtoAsync(entity));
        }

        public override async Task<FormConfigurationDto> CreateAsync(CreateFormConfigurationRequest input)
        {
            var module = await _moduleRepository.GetAsync(input.ModuleId);
            module.EnsureEditable();

            var folder = input.FolderId != null
                ? await _folderRepository.GetAsync(input.FolderId.Value)
                : null;

            var formInput = new CreateFormInput
            {
                Module = module,
                Folder = folder,
                Name = input.Name,
                Description = input.Description,
                Label = input.Label,
                Markup = input.Markup,
                ModelType = input.ModelType,
                GenerationLogicExtensionJson = input.GenerationLogicExtensionJson,
                TemplateId = input.TemplateId,
            };

            var form = await _formManager.CreateFormAsync(formInput);
            return await MapToEntityDtoAsync(form);
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
            // check cache
            if (!string.IsNullOrWhiteSpace(input.Md5))
            {
                var cachedMd5 = await _clientSideCache.GetCachedMd5Async(FormConfiguration.ItemTypeName, null, input.Module, input.Name);
                if (input.Md5 == cachedMd5)
                    throw new ContentNotModifiedException("Form not changed");
            }

            var moduleEntity = await GetModuleAsync(input.Module);

            // todo: move to a generic method
            var query = Repository.GetAll().Where(f => f.Module == moduleEntity &&
                f.Name == input.Name);

            var form = await AsyncQueryableExecuter.FirstOrDefaultAsync(query);

            if (form == null)
                throw new FormNotFoundException(input.Module, input.Name);

            var dto = await MapToEntityDtoAsync(form);

            //await _clientSideCache.SetCachedMd5Async(FormConfiguration.ItemTypeName, null, input.Module, input.Name, dto.CacheMd5);

            if (!await CheckFormPermissionsAsync(form.Module?.Name, form.Name))
            {
                dto.Markup = null;
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

            // add MD5 to request
            //await _clientSideCache.SetCachedMd5Async(FormConfiguration.ItemTypeName, input.Id, dto.CacheMd5);

            if (!await CheckFormPermissionsAsync(form.Module?.Name, form.Name))
            {
                dto.Markup = null;
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

            await Repository.UpdateAsync(form);

            if (input.Access > RefListPermissionedAccess.Inherited)
            {
                var permisson = new PermissionedObjectDto
                {
                    Object = FormManager.GetFormPermissionedObjectName(form.Module?.Name, form.Name),
                    Name = $"{form.Module?.Name}.{form.Name}",
                    Module = form.Module?.Name,
                    ModuleId = form.Module?.Id,
                    Type = ShaPermissionedObjectsTypes.Form,
                    Access = input.Access,
                    Permissions = input.Permissions,
                };

                await _permissionedObjectManager.SetAsync(permisson);
            }
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

            if (input.File == null || input.File.Length == 0)
                validationResults.Add(new ValidationResult($"Please upload JSON file"));
            else {
                var extension = Path.GetExtension(input.File.FileName)?.ToLower();
                if (extension != ".json")
                    validationResults.Add(new ValidationResult($"Import supports only json files"));                 
            }

            if (validationResults.Any())
                throw new AbpValidationException("Failed to import JSON", validationResults);

            input.File.NotNull();
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

            var alreadyExist = await Repository.GetAll().Where(f => f.Id != input.Id && f.Module != null && f.Module.Name == input.ModelType && f.Name == input.Name).AnyAsync();
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
            entity.ConfigurationForm =  new FormIdentifier(input.ConfigurationFormModule, input.ConfigurationFormName!);
            entity.GenerationLogicTypeName = input.GenerationLogicTypeName;
            entity.GenerationLogicExtensionJson = input.GenerationLogicExtensionJson;
            entity.PlaceholderIcon = input.PlaceholderIcon;
            await CurrentUnitOfWork.SaveChangesAsync();

            return await MapToEntityDtoAsync(entity);
        }

        #region private methods

        /// <summary>
        /// Ger module by name
        /// </summary>
        /// <param name="moduleName"></param>
        /// <returns></returns>
        private async Task<Module?> GetModuleAsync(string? moduleName) 
        {
            return !string.IsNullOrWhiteSpace(moduleName)
                ? await AsyncQueryableExecuter.FirstOrDefaultAsync(_moduleRepository.GetAll().Where(m => m.Name == moduleName))
                : null;
        }

        #endregion

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
    }
}