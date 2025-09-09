using Abp.Application.Services.Dto;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Runtime.Validation;
using Abp.Timing;
using AutoMapper;
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
using Shesha.Reflection;
using Shesha.Validations;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
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

            foreach (var item in itemsToExpose) 
            {
                var manager = CiHelper.GetManager(item);
                var newItem = await manager.ExposeAsync(item, module);
                newItem.Folder = folder;
                await ItemRepo.UpdateAsync(newItem);
            }
        }

        public async Task<IConfigurationItemDto> GetItemAsync(GetItemRequest request)
        {
            var moduleId = await ModuleManager.GetModuleIdAsync(request.Module);

            var manager = CiHelper.GetManager(request.ItemType);

            var item = await manager.GetItemAsync(request.Module, request.Name);

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

        private Task HandleConfigurationItemRevisionAsync<TItem, TRevision>(TItem entity)
            where TItem : ConfigurationItem<TRevision>
            where TRevision : ConfigurationItemRevision, new()
        {
            /*
             * TODO: detect changes and skip creation of new revision if properties stay unchanged
            A new version should automatically be created whenever one of the following occurs:
            1.	a new configuration item is imported from a package, 
            2.	a configuration change is made more than 15 minutes after the last recorded change
            3.	a configuration change is made by a user which is different from the user who made the previous configuration change, regardless of the time since the last change.
             */
            var revision = entity.LatestRevision;
            var newRevisionRequired = revision == null ||
                revision.LastModificationTime != null && revision.LastModificationTime < Clock.Now.AddMinutes(-15) ||
                revision.LastModifierUserId != AbpSession.UserId;

            if (newRevisionRequired) 
            {
                var prevRevision = entity.LatestRevision;
                var newRevision = new TRevision { ConfigurationItem = entity };

                /**/
                // TODO: move to a manager
                // TODO: cache mapper as part of manager
                // TODO: cover by unit tests
                var modelConfigMapperConfig = new MapperConfiguration(cfg =>
                {
                    var mapExpression = cfg.CreateMap<TRevision, TRevision>()
                        .ForMember(d => d.Id, o => o.Ignore())

                        .ForMember(d => d.VersionName, o => o.Ignore())
                        .ForMember(d => d.Comments, o => o.Ignore())
                        .ForMember(d => d.ConfigHash, o => o.Ignore())
                        .ForMember(d => d.IsCompressed, o => o.Ignore())
                        .ForMember(d => d.CreatedByImport, o => o.Ignore())
                        .ForMember(d => d.ParentRevision, o => o.Ignore())
                        
                        // audit properties
                        .ForMember(d => d.CreationTime, o => o.Ignore())
                        .ForMember(d => d.CreationTime, o => o.Ignore())
                        .ForMember(d => d.IsDeleted, o => o.Ignore())
                        .ForMember(d => d.DeleterUserId, o => o.Ignore())
                        .ForMember(d => d.DeletionTime, o => o.Ignore())
                        .ForMember(d => d.LastModificationTime, o => o.Ignore())
                        .ForMember(d => d.LastModifierUserId, o => o.Ignore())

                        .ForMember(d => d.ConfigurationItem, o => o.Ignore());
                });
                var mapper = modelConfigMapperConfig.CreateMapper();

                mapper.Map(prevRevision, newRevision);

                newRevision.VersionNo = prevRevision.VersionNo + 1;
                newRevision.ParentRevision = prevRevision;

                /**/

                entity.LatestRevision = newRevision;
            }

            return Task.CompletedTask;
        }

        private async Task GenericUpdateItemAsync<TItem, TRevision, TDynamicDto>(TItem entity, TDynamicDto input)
            where TItem: ConfigurationItem<TRevision>, IEntity<Guid>
            where TDynamicDto : class, IDynamicDto<TItem, Guid>
            where TRevision: ConfigurationItemRevision, new()
        {
            await HandleConfigurationItemRevisionAsync<TItem, TRevision>(entity);
            entity.LatestRevision.NotNull();

            var parts = ConfigurationItemUpdater<TItem, TRevision, TDynamicDto>.ExtractConfigurationItemDtoParts(input.Id, input);

            // 1. bind item
            if (parts.Item != null) 
            {
                var itemResult = await MapDynamicDtoToEntityAsync<TDynamicDto, TItem, Guid>(parts.Item, entity);
                itemResult.ValidationResults.ThrowValidationExceptionIfAny(L);
                
                var itemRepository = IocManager.Resolve<IRepository<TItem, Guid>>();
                await itemRepository.UpdateAsync(entity);

                var result = await DelayedUpdateAsync<TDynamicDto, TItem, Guid>(input, entity);
                result.ValidationResults.ThrowValidationExceptionIfAny(L);
            }

            // 2. bind revision
            if (parts.Revision != null)
            {
                var revisionResult = await MapDynamicDtoToEntityAsync<IDynamicDto<TRevision, Guid>, TRevision, Guid>(parts.Revision, entity.LatestRevision);
                revisionResult.ValidationResults.ThrowValidationExceptionIfAny(L);

                var revisionRepository = IocManager.Resolve<IRepository<TRevision, Guid>>();
                await revisionRepository.InsertOrUpdateAsync(entity.LatestRevision);
            }

            await UnitOfWorkManager.Current.SaveChangesAsync();            
        }

        private async Task<ConfigurationItem> NonGenericUpdateItemAsync(ConfigurationItem entity, IDynamicDto<ConfigurationItem, Guid> input)
        {
            var itemType = entity.GetType().StripCastleProxyType();
            var revisionType = itemType.GetRequiredProperty(nameof(IConfigurationItem<ConfigurationItemRevision>.LatestRevision)).PropertyType;
            var dtoType = typeof(DynamicDto<,>).MakeGenericType([itemType, typeof(Guid)]);

            var dto = ActivatorHelper.CreateNotNullObject(dtoType);
            
            (dto as IEntityDto<Guid>).NotNull().Id = input.Id;
            (dto as IHasJObjectField).NotNull()._jObject = input._jObject;

            var methodType = GetType().GetRequiredMethod(nameof(GenericUpdateItemAsync), BindingFlags.NonPublic | BindingFlags.Instance);
            var genericMethodType = methodType.MakeGenericMethod(itemType, revisionType, dtoType);
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
            var item = await ItemRepo.GetAsync(request.ItemId);

            var revisions = await RevisionRepo.GetAll().Where(e => e.ConfigurationItem == item).OrderByDescending(e => e.CreationTime).ToListAsync();

            var dtos = revisions.Select(e => new ConfigurationItemRevisionDto
            {
                Id = e.Id,
                VersionNo = e.VersionNo,
                VersionName = e.VersionName,
                Comments = e.Comments,
                ConfigHash = e.ConfigHash,
                IsCompressed = e.IsCompressed,

                CreationTime = e.CreationTime,
                CreatorUserId = e.CreatorUserId,
                CreatorUserName = e.CreatorUser?.FullName ?? string.Empty,
            }).ToList();

            return new GetItemRevisionsResponse { 
                Revisions = dtos
            };
        }
    }
}
