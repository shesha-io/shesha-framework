using Abp.Application.Services.Dto;
using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Runtime.Validation;
using Microsoft.AspNetCore.Mvc;
using Shesha.Application.Services.Dto;
using Shesha.Attributes;
using Shesha.Authorization;
using Shesha.Configuration.Security;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities;
using Shesha.DynamicEntities.Dtos;
using Shesha.GraphQL.Mvc;
using Shesha.Permissions;
using Shesha.Permissions.Entity;
using Shesha.Reflection;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha
{
    [DynamicControllerNameConvention]
    public class DynamicCrudAppService<TEntity, TDynamicDto, TCreateDynamicDto, TUpdateDynamicDto, TPrimaryKey> :
        SheshaCrudServiceBase<TEntity, TDynamicDto, TPrimaryKey, PropsFilteredPagedAndSortedResultRequestDto, TCreateDynamicDto, TUpdateDynamicDto, GetDynamicEntityInput<TPrimaryKey>>,
        IDynamicCrudAppService<TEntity, TDynamicDto, TPrimaryKey>,
        ITransientDependency
        where TEntity : class, IEntity<TPrimaryKey>
        where TDynamicDto : class, IDynamicDto<TEntity, TPrimaryKey>
        where TCreateDynamicDto: class, TDynamicDto
        where TUpdateDynamicDto : class, TDynamicDto
    {
        public IObjectPermissionChecker ObjectPermissionChecker { get; set; }
        public ISecuritySettings SecuritySettings { get; set; }
        public bool SkipEnabledCheck { get; set; }

        public DynamicCrudAppService(
            IRepository<TEntity, TPrimaryKey> repository
            ) : base(repository)
        {
        }

        private void EnsureCrudActionEnabled(CrudAction crudAction)
        {
            if (SkipEnabledCheck)
                return;
            var disabled = EntityCrudHelper.IsCrudActionDisabledByCode(typeof(TEntity), crudAction);
            var isConfigurable = EntityCrudHelper.IsCrudActionsConfigurable(typeof(TEntity));
            if (disabled && !isConfigurable)
                throw new EntityNotFoundException(L("NotFound") ?? "Not found");
        }

        private async Task CheckCrudActionPermissionsAsync(CrudAction crudAction)
        {
            var securitySettings = await SecuritySettings.SecuritySettings.GetValueAsync();
            var defaultAccess = securitySettings?.DefaultEndpointAccess;

            var method = PermissionedObjectManager.CrudAction2Method(crudAction);
            await ObjectPermissionChecker.AuthorizeAsync(false, typeof(TEntity).FullName, method, ShaPermissionedObjectsTypes.EntityAction, AbpSession.UserId.HasValue, defaultAccess);
        }

        /// <summary>
        /// Ensure that the CRUD action is available (enabled and user has access to it)
        /// </summary>
        /// <param name="crudAction"></param>
        /// <returns></returns>
        private async Task EnsureCrudActionAvailableAsync(CrudAction crudAction) 
        {
            EnsureCrudActionEnabled(crudAction);
            await CheckCrudActionPermissionsAsync(crudAction);            
        }

        [EntityAction(StandardEntityActions.Read)]
        public override async Task<TDynamicDto> GetAsync(GetDynamicEntityInput<TPrimaryKey> input)
        {
            await EnsureCrudActionAvailableAsync(CrudAction.Read);
            CheckGetPermission();

            var permissionedEntityProvider = IocManager.Resolve<IPermissionedEntityProvider>(); 
            var entity = await Repository.GetAsync(input.Id);
            var permissionedProxy = permissionedEntityProvider.GetPermissionedEntityOrEntity(entity);
            return await MapToCustomDynamicDtoAsync<TDynamicDto, TEntity, TPrimaryKey>(permissionedProxy.NotNull(), new DynamicMappingSettings()
            {
                UseDtoForEntityReferences = true
            });
        }

        [EntityAction(StandardEntityActions.List)]
        public override async Task<PagedResultDto<TDynamicDto>> GetAllAsync(PropsFilteredPagedAndSortedResultRequestDto input)
        {
            await EnsureCrudActionAvailableAsync(CrudAction.Read);
            CheckGetAllPermission();

            var permissionedEntityProvider = IocManager.Resolve<IPermissionedEntityProvider>(); 
            var query = CreateFilteredQuery(input);

            var totalCount = await AsyncQueryableExecuter.CountAsync(query);

            query = ApplySorting(query, input);
            query = ApplyPaging(query, input);

            var entities = await AsyncQueryableExecuter.ToListAsync(query);

            var list = new List<TDynamicDto>();
            foreach (var entity in entities)
            {
                var permissionedProxy = permissionedEntityProvider.GetPermissionedEntityOrEntity(entity);
                list.Add(await MapToCustomDynamicDtoAsync<TDynamicDto, TEntity, TPrimaryKey>(permissionedProxy, new DynamicMappingSettings()
                {
                    UseDtoForEntityReferences = true
                }));
            }

            return new PagedResultDto<TDynamicDto>(
                totalCount,
                list
            );
        }

        [EntityAction(StandardEntityActions.Create)]
        public override async Task<TDynamicDto> CreateAsync(TCreateDynamicDto input)
        {
            await EnsureCrudActionAvailableAsync(CrudAction.Create);
            CheckCreatePermission();
            var permissionedEntityProvider = IocManager.Resolve<IPermissionedEntityProvider>();
            var entity = await InternalCreateAsync(input);
            var permissionedProxy = permissionedEntityProvider.GetPermissionedEntityOrEntity(entity);
            return await MapToCustomDynamicDtoAsync<TDynamicDto, TEntity, TPrimaryKey>(permissionedProxy, new DynamicMappingSettings()
            {
                UseDtoForEntityReferences = true
            });
        }

        [EntityAction(StandardEntityActions.Update)]
        public override async Task<TDynamicDto> UpdateAsync(TUpdateDynamicDto input)
        {
            await EnsureCrudActionAvailableAsync(CrudAction.Update);
            CheckUpdatePermission();
            var permissionedEntityProvider = IocManager.Resolve<IPermissionedEntityProvider>();
            var entity = await InternalUpdateAsync(input);
            var permissionedProxy = permissionedEntityProvider.GetPermissionedEntityOrEntity(entity);
            return await MapToCustomDynamicDtoAsync<TDynamicDto, TEntity, TPrimaryKey>(permissionedProxy, new DynamicMappingSettings()
            {
                UseDtoForEntityReferences = true
            });
        }

        [EntityAction(StandardEntityActions.Delete)]
        public override async Task DeleteAsync(EntityDto<TPrimaryKey> input)
        {
            await EnsureCrudActionAvailableAsync(CrudAction.Delete);
            CheckDeletePermission();
            await base.DeleteAsync(input);
        }

        private async Task<TEntity> InternalUpdateAsync(TDynamicDto input)
        {
            var entity = await Repository.GetAsync(input.Id);

            var result = await MapDynamicDtoToEntityAsync<TDynamicDto, TEntity, TPrimaryKey>(input, entity);
            if (result.HasValidationError)
                throw new AbpValidationException("Please correct the errors and try again", result.ValidationResults);

            await Repository.UpdateAsync(entity);
            await UnitOfWorkManager.Current.SaveChangesAsync();

            result = await DelayedUpdateAsync<TDynamicDto, TEntity, TPrimaryKey>(input, entity);
            if (result.HasValidationError)
                throw new AbpValidationException("Please correct the errors and try again", result.ValidationResults);

            return entity;
        }

        /// <summary>
        /// Update entity data. 
        /// NOTE: don't use on prod, this is merged with the `Update`endpoint
        /// </summary>
        /// <param name="properties">List of properties to fetch in GraphQL-like syntax. Supports nested properties</param>
        /// <param name="input"></param>
        /// <returns></returns>
        /// <response code="200">NOTE: shape of the `result` depends on the `properties` argument. When `properties` argument is not specified - it returns top level properties of the entity, all referenced entities are presented as their Id values</response>
        [ApiExplorerSettings(IgnoreApi = true)]
        public virtual async Task<GraphQLDataResult<TEntity>> UpdateGqlAsync(string properties, TDynamicDto input)
        {
            await EnsureCrudActionAvailableAsync(CrudAction.Update);
            CheckUpdatePermission();
            var entity = await InternalUpdateAsync(input);
            return await InternalQueryAsync(new GetDynamicEntityInput<TPrimaryKey>() { Id = entity.Id, Properties = properties });
        }

        private async Task<TEntity> InternalCreateAsync(TCreateDynamicDto input)
        {
            var entity = Activator.CreateInstance<TEntity>();

            var result = await MapDynamicDtoToEntityAsync<TDynamicDto, TEntity, TPrimaryKey>(input, entity, async (ent, validationResults) =>
            {
                await Repository.InsertAsync(entity);
                await UnitOfWorkManager.Current.SaveChangesAsync();
            });
            if (result.HasValidationError)
                throw new AbpValidationException("Please correct the errors and try again", result.ValidationResults);

            result = await DelayedUpdateAsync<TDynamicDto, TEntity, TPrimaryKey>(input, entity);
            if (result.HasValidationError)
                throw new AbpValidationException("Please correct the errors and try again", result.ValidationResults);

            await UnitOfWorkManager.Current.SaveChangesAsync();
            return entity;
        }

        /// <summary>
        /// Create entity.
        /// NOTE: don't use on prod, this is merged with the `Create`endpoint
        /// </summary>
        /// <param name="properties">List of properties to fetch in GraphQL-like syntax. Supports nested properties</param>
        /// <param name="input"></param>
        /// <returns></returns>
        /// <response code="200">NOTE: shape of the `result` depends on the `properties` argument. When `properties` argument is not specified - it returns top level properties of the entity, all referenced entities are presented as their Id values</response>
        [ApiExplorerSettings(IgnoreApi = true)]
        public virtual async Task<GraphQLDataResult<TEntity>> CreateGqlAsync(string properties, TCreateDynamicDto input)
        {
            await EnsureCrudActionAvailableAsync(CrudAction.Create);
            CheckCreatePermission();
            var entity = await InternalCreateAsync(input);
            return await InternalQueryAsync(new GetDynamicEntityInput<TPrimaryKey>() { Id = entity.Id, Properties = properties });
        }

        public override async Task<GraphQLDataResult<TEntity>> QueryAsync(GetDynamicEntityInput<TPrimaryKey> input) 
        {
            await EnsureCrudActionAvailableAsync(CrudAction.Read);
            return await base.QueryAsync(input);
        }

        public override async Task<GraphQLDataResult<PagedResultDto<TEntity>>> QueryAllAsync(PropsFilteredPagedAndSortedResultRequestDto input) 
        { 
            await EnsureCrudActionAvailableAsync(CrudAction.Read);
            return await base.QueryAllAsync(input);
        }
    }

    [DynamicControllerNameConvention]
    public class DynamicCrudAppService<TEntity, TDynamicDto, TPrimaryKey> : DynamicCrudAppService<TEntity, TDynamicDto, TDynamicDto, TDynamicDto, TPrimaryKey>, ITransientDependency
    where TEntity : class, IEntity<TPrimaryKey>
    where TDynamicDto : class, IDynamicDto<TEntity, TPrimaryKey>
    {
        public DynamicCrudAppService(
            IRepository<TEntity, TPrimaryKey> repository
        ) : base(repository)
        {
        }
    }
}
