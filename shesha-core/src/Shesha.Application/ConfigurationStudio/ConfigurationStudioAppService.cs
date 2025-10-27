using Abp.Application.Services.Dto;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Runtime.Validation;
using Microsoft.AspNetCore.Mvc;
using Shesha.ConfigurationItems;
using Shesha.ConfigurationItems.Exceptions;
using Shesha.ConfigurationStudio.Dtos;
using Shesha.Domain;
using Shesha.Dto;
using Shesha.Dto.Interfaces;
using Shesha.DynamicEntities;
using Shesha.DynamicEntities.Dtos;
using Shesha.Extensions;
using Shesha.Mvc;
using Shesha.Reflection;
using Shesha.Utilities;
using Shesha.Validations;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.ConfigurationStudio
{
    /// <summary>
    /// Configuration Studio application service
    /// </summary>
    public partial class ConfigurationStudioAppService: SheshaAppServiceBase
    {
        public IConfigurationFrameworkRuntime CfRuntime { get; set; }
        public IModuleManager ModuleManager { get; set; }
        public IConfigurationItemHelper CiHelper { get; set; }
        public IRepository<ConfigurationItem, Guid> ItemRepo { get; set; }
        public IRepository<ConfigurationItemRevision, Guid> RevisionRepo { get; set; }
        public IRepository<ConfigurationItemHistoryItem, Guid> HistoryRepo { get; set; }        

        /// <summary>
        /// Expose Item
        /// </summary>
        /// <returns></returns>
        public async Task<ExposeItemResponse> ExposeItemAsync(ExposeItemRequest request)
        {
            var moduleId = await ModuleManager.GetModuleIdAsync(request.Module);

            var item = await ItemRepo.GetAll().Where(e => e.Module != null && e.Module.Id == moduleId && e.Name == request.Name && e.ItemType == request.ItemType).FirstOrDefaultAsync();
            if (item == null)
                throw new ConfigurationItemNotFoundException(request.ItemType, request.Module, request.Name, null);

            var manager = CiHelper.GetManager(item);

            // TODO: check if item is already exposed

            var module = await ModuleManager.GetModuleAsync(CfRuntime.CurrentModule);
            var newItem = await manager.ExposeAsync(item, module);

            return new ExposeItemResponse();
        }

        /// <summary>
        /// Expose configuration items
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        /// <exception cref="ConfigurationItemNotFoundException"></exception>
        [HttpPost]
        public async Task ExposeAsync(ExposeRequest request)
        {
            var module = await ModuleRepository.GetAsync(request.ModuleId);
            module.EnsureEditable();

            var folder = request.FolderId != null
                ? await FolderRepository.GetAsync(request.FolderId.Value)
                : null;

            if (folder != null && folder.Module != module)
                throw new AbpValidationException($"Selected folder '{folder.Name}' doesn't belong to module '{module.Name}'");

            /* TODO: add validation
             * Validate request: check each items and terminate expose if destination module already contains CI with the same name
             */
            var itemsToExpose = await ItemRepo.GetListInBatchesAsync(request.ItemIds);

            using (CfRuntime.DisableConfigurationTracking()) 
            {
                foreach (var item in itemsToExpose)
                {
                    var manager = CiHelper.GetManager(item);
                    var newItem = await manager.ExposeAsync(item, module);
                    newItem.Folder = folder;
                    await ItemRepo.UpdateAsync(newItem);
                }
            }
        }

        public async Task<IConfigurationItemDto> GetItemAsync(GetItemRequest request)
        {
            var moduleId = await ModuleManager.GetModuleIdAsync(request.Module);

            var manager = CiHelper.GetManager(request.ItemType);

            var item = await manager.ResolveItemAsync(request.Module, request.Name);

            var dto = await manager.MapToDtoAsync(item);

            return dto;
        }

        public Task<List<IConfigurationItemTypeDto>> GetAvailableItemTypesAsync() 
        {
            return CiHelper.GetAvailableItemTypesAsync();
        }

        #region Configuration Items

        [HttpPost]
        public async Task<IConfigurationItemDto> CreateItemAsync(CreateConfigurationItemRequest request)
        {
            var module = await ModuleManager.GetModuleAsync(request.ModuleId);
            module.EnsureEditable();

            var manager = CiHelper.GetManager(request.ItemType);
            var folder = request.FolderId != null
                ? await FolderRepository.GetAsync(request.FolderId.Value)
                : null;

            var item = await manager.CreateItemAsync(new ConfigurationItems.Models.CreateItemInput
            {
                Module = module,
                Folder = folder,
                Name = request.Name,
                Label = request.Label,
                Description = request.Description,
            });

            var dto = await manager.MapToDtoAsync(item);

            return dto;
        }

        [HttpPut]
        public async Task<IConfigurationItemDto> UpdateItemAsync(UpdateConfigurationItemRequest request) 
        {
            var item = await ItemRepo.GetAsync(request.Id);
            item.Module?.EnsureEditable();

            await NonGenericUpdateItemAsync(item, request);

            var manager = CiHelper.GetManager(item.ItemType);
            var dto = await manager.MapToDtoAsync(item);
            return dto;
        }

        private async Task GenericUpdateItemAsync<TItem, TDynamicDto>(TItem entity, TDynamicDto input)
            where TItem: ConfigurationItem, IEntity<Guid>
            where TDynamicDto : class, IDynamicDto<TItem, Guid>
        {
            var itemResult = await MapDynamicDtoToEntityAsync<TDynamicDto, TItem, Guid>(input, entity);
            itemResult.ValidationResults.ThrowValidationExceptionIfAny(L);

            var itemRepository = IocManager.Resolve<IRepository<TItem, Guid>>();
            await itemRepository.UpdateAsync(entity);

            var result = await DelayedUpdateAsync<TDynamicDto, TItem, Guid>(input, entity);
            result.ValidationResults.ThrowValidationExceptionIfAny(L);

            await UnitOfWorkManager.Current.SaveChangesAsync();            
        }

        private async Task<ConfigurationItem> NonGenericUpdateItemAsync(ConfigurationItem entity, IDynamicDto<ConfigurationItem, Guid> input)
        {
            var itemType = entity.GetType().StripCastleProxyType();
            var dtoType = typeof(DynamicDto<,>).MakeGenericType([itemType, typeof(Guid)]);

            var dto = ActivatorHelper.CreateNotNullObject(dtoType);
            
            (dto as IEntityDto<Guid>).NotNull().Id = input.Id;
            (dto as IHasJObjectField).NotNull()._jObject = input._jObject;

            var methodType = GetType().GetRequiredMethod(nameof(GenericUpdateItemAsync), BindingFlags.NonPublic | BindingFlags.Instance);
            var genericMethodType = methodType.MakeGenericMethod(itemType, dtoType);
            var result = genericMethodType.Invoke<Task>(this, [entity, dto]).NotNull();
            await result;

            return entity;
        }

        [HttpDelete]
        public async Task DeleteItemAsync(DeleteConfigurationItemRequest request) 
         {
            var item = await ItemRepo.GetAsync(request.ItemId);
            item.Module?.EnsureEditable();

            await ItemRepo.DeleteAsync(item);
        }

        [HttpPut]
        public async Task RenameItemAsync(RenameConfigurationItemRequest request)
        {
            var item = await ItemRepo.GetAsync(request.ItemId);
            item.Module?.EnsureEditable();

            item.Name = request.Name;
            await ItemRepo.UpdateAsync(item);
        }

        [HttpPost]
        public async Task<DuplicateConfigurationItemResponse> DuplicateItemAsync(DuplicateConfigurationItemRequest request)
        {
            var item = await ItemRepo.GetAsync(request.ItemId);
            item.Module?.EnsureEditable();

            var manager = CiHelper.GetManager(item);
            var duplicate = await manager.DuplicateAsync(item);

            return new DuplicateConfigurationItemResponse { ItemId = duplicate.Id };
        }

        #endregion

        public async Task<GetItemRevisionsResponse> GetItemRevisionsAsync(GetItemRevisionsRequest request) 
        {
            var revisions = await HistoryRepo.GetAll().Where(e => e.ConfigurationItemId == request.ItemId).OrderByDescending(e => e.CreationTime).ToListAsync();

            var dtos = revisions.Select(e => new ConfigurationItemRevisionDto
            {
                Id = e.Id,
                ModuleName = e.ModuleName,
                IsEditable = e.IsEditable,
                VersionNo = e.VersionNo,
                VersionName = e.VersionName,
                Comments = e.Comments,
                ConfigHash = e.ConfigHash,
                IsCompressed = e.IsCompressed,
                CreationMethod = e.CreationMethod,
                DllVersionNo = e.DllVersionNo,

                CreationTime = e.CreationTime,
                CreatorUserId = e.CreatorUserId,
                CreatorUserName = e.CreatorUser?.FullName ?? string.Empty,
            }).ToList();

            return new GetItemRevisionsResponse { 
                Revisions = dtos
            };
        }

        [HttpPut]
        public async Task RenameRevisionAsync(RenameRevisionRequest request) 
        { 
            var revision = await RevisionRepo.GetAsync(request.RevisionId);
            revision.ConfigurationItem.Module?.EnsureEditable();

            revision.VersionName = request.VersionName;

            await RevisionRepo.UpdateAsync(revision);
        }

        [HttpPost]
        public async Task RestoreItemRevisionAsync(RestoreItemRevisionRequest request) 
        {
            var item = await ItemRepo.GetAsync(request.ItemId);
            item.Module?.EnsureEditable();

            var revision = await RevisionRepo.GetAsync(request.RevisionId);
            if (revision.ConfigurationItem != item)
                throw new AbpValidationException("Selected revision doesn't belong to the item");
            
            var manager = CiHelper.GetManager(item.ItemType);

            await manager.RestoreRevisionAsync(revision);
        }

        /// <summary>
        /// Get revision in JSON format
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet]
        public async Task<FileContentResult> GetRevisionJsonAsync(Guid id)
        {
            var revision = await RevisionRepo.GetAsync(id);

            var bytes = Encoding.UTF8.GetBytes(revision.ConfigurationJson ?? "");

            var fileName = $"{revision.ConfigurationItem.FullName} (revision {revision.VersionNo})".RemovePathIllegalCharacters() + ".json";

            return new ShaFileContentResult(bytes, "application/json") { FileDownloadName = fileName };
        }
    }
}
