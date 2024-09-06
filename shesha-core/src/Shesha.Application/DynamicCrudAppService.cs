using Abp.Application.Services.Dto;
using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Runtime.Validation;
using Microsoft.AspNetCore.Mvc;
using Shesha.Application.Services.Dto;
using Shesha.Attributes;
using Shesha.DelayedUpdate;
using Shesha.DynamicEntities;
using Shesha.DynamicEntities.Dtos;
using Shesha.GraphQL.Mvc;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha
{
    [DynamicControllerNameConvention]
    public class DynamicCrudAppService<TEntity, TDynamicDto, TPrimaryKey> : SheshaCrudServiceBase<TEntity,
        TDynamicDto, TPrimaryKey, PropsFilteredPagedAndSortedResultRequestDto, TDynamicDto, TDynamicDto, GetDynamicEntityInput<TPrimaryKey>>, IDynamicCrudAppService<TEntity, TDynamicDto, TPrimaryKey>, ITransientDependency
        where TEntity : class, IEntity<TPrimaryKey>
        where TDynamicDto : class, IDynamicDto<TEntity, TPrimaryKey>
    {

        public DynamicCrudAppService(
            IRepository<TEntity, TPrimaryKey> repository
            ) : base(repository)
        {
        }

        [EntityAction(StandardEntityActions.Read)]
        public override async Task<TDynamicDto> GetAsync(GetDynamicEntityInput<TPrimaryKey> input)
        {
            CheckGetPermission();

            var entity = await Repository.GetAsync(input.Id);

            return await MapToCustomDynamicDtoAsync<TDynamicDto, TEntity, TPrimaryKey>(entity, new DynamicMappingSettings()
            {
                UseDtoForEntityReferences = true
            });
        }

        [EntityAction(StandardEntityActions.List)]
        public override async Task<PagedResultDto<TDynamicDto>> GetAllAsync(PropsFilteredPagedAndSortedResultRequestDto input)
        {
            CheckGetAllPermission();

            var query = CreateFilteredQuery(input);

            var totalCount = await AsyncQueryableExecuter.CountAsync(query);

            query = ApplySorting(query, input);
            query = ApplyPaging(query, input);

            var entities = await AsyncQueryableExecuter.ToListAsync(query);

            var list = new List<TDynamicDto>();
            foreach (var entity in entities)
            {
                list.Add(await MapToCustomDynamicDtoAsync<TDynamicDto, TEntity, TPrimaryKey>(entity, new DynamicMappingSettings()
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
        public override async Task<TDynamicDto> CreateAsync(TDynamicDto input)
        {
            CheckCreatePermission();
            var entity = await InternalCreateAsync(input);
            return await MapToCustomDynamicDtoAsync<TDynamicDto, TEntity, TPrimaryKey>(entity, new DynamicMappingSettings()
            {
                UseDtoForEntityReferences = true
            });
        }

        [EntityAction(StandardEntityActions.Update)]
        public override async Task<TDynamicDto> UpdateAsync(TDynamicDto input)
        {
            CheckUpdatePermission();
            var entity = await InternalUpdateAsync(input);
            return await MapToCustomDynamicDtoAsync<TDynamicDto, TEntity, TPrimaryKey>(entity, new DynamicMappingSettings()
            {
                UseDtoForEntityReferences = true
            });
        }

        private async Task<TEntity> InternalUpdateAsync(TDynamicDto input)
        {
            var entity = await Repository.GetAsync(input.Id);
            var jObject = (input as IHasJObjectField)._jObject;
            List<DelayedUpdateGroup> delayedUpdate = null;
            var validationResults = new List<ValidationResult>();

            if (jObject != null)
            {
                // Update the Jobject from the input because it might have changed
                ObjectToJsonExtension.ObjectToJObject(input, jObject);

                var result = await MapJObjectToEntityAsync<TEntity, TPrimaryKey>(jObject, entity, validationResults);
                if (!result)
                    throw new AbpValidationException("Please correct the errors and try again", validationResults);

                delayedUpdate = jObject.Property(nameof(IHasDelayedUpdateField._delayedUpdate))?.Value?.ToObject<List<DelayedUpdateGroup>>();
            }
            else
            {
                await MapDynamicDtoToEntityAsync<TDynamicDto, TEntity, TPrimaryKey>(input, entity);
                await FluentValidationsOnEntityAsync(entity, validationResults);

                if (validationResults.Any<ValidationResult>())
                    throw new AbpValidationException("Please correct the errors and try again", validationResults);

                if (!Validator.TryValidateObject(entity, new ValidationContext(entity), validationResults))
                    throw new AbpValidationException("Please correct the errors and try again", validationResults);

                delayedUpdate = (input as IHasDelayedUpdateField)._delayedUpdate;
            }

            await Repository.UpdateAsync(entity);
            await UnitOfWorkManager.Current.SaveChangesAsync();

            if (delayedUpdate?.Any() ?? false)
            {
                await DelayedUpdateAsync<TEntity, TPrimaryKey>(delayedUpdate, entity, validationResults);
                if (validationResults.Any<ValidationResult>())
                    throw new AbpValidationException("Please correct the errors and try again", validationResults);
            }

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
            CheckUpdatePermission();
            var entity = await InternalUpdateAsync(input);
            return await QueryAsync(new GetDynamicEntityInput<TPrimaryKey>() { Id = entity.Id, Properties = properties });
        }

        private async Task<TEntity> InternalCreateAsync(TDynamicDto input)
        {
            var entity = Activator.CreateInstance<TEntity>();

            var jObject = (input as IHasJObjectField)._jObject;

            if (jObject != null)
            {
                // Update the Jobject from the input because it might have changed
                ObjectToJsonExtension.ObjectToJObject(input, jObject);

                var validationResults = new List<ValidationResult>();
                var result = await MapJObjectToEntityAsync<TEntity, TPrimaryKey>(jObject, entity, validationResults);
                if (!result)
                    throw new AbpValidationException("Please correct the errors and try again", validationResults);

                await Repository.InsertAsync(entity);

                await DelayedUpdateAsync<TEntity, TPrimaryKey>(jObject, entity, validationResults);

                if (validationResults.Any<ValidationResult>())
                    throw new AbpValidationException("Please correct the errors and try again", validationResults);
            }
            else
            {
                await MapStaticPropertiesToEntityDtoAsync<TDynamicDto, TEntity, TPrimaryKey>(input, entity);

                var validationResults = new List<ValidationResult>();

                await FluentValidationsOnEntityAsync(entity, validationResults);

                if (validationResults.Any<ValidationResult>())
                    throw new AbpValidationException("Please correct the errors and try again", validationResults);

                if (!Validator.TryValidateObject(entity, new ValidationContext(entity), validationResults))
                    throw new AbpValidationException("Please correct the errors and try again", validationResults);

                await Repository.InsertAsync(entity);

                var _delayedUpdate = (input as IHasDelayedUpdateField)?._delayedUpdate;
                if (_delayedUpdate?.Any() ?? false)
                {
                    await DelayedUpdateAsync<TEntity, TPrimaryKey>(_delayedUpdate, entity, validationResults);

                    if (validationResults.Any<ValidationResult>())
                        throw new AbpValidationException("Please correct the errors and try again", validationResults);
                }
            }

            await UnitOfWorkManager.Current.SaveChangesAsync();

            if (jObject != null)
            {
                var validationResults = new List<ValidationResult>();
                var result = await MapJObjectToDynamicPropertiesEntityAsync<TEntity, TPrimaryKey>(jObject, entity, validationResults);
                if (!result)
                    throw new AbpValidationException("Please correct the errors and try again", validationResults);
            }
            else
            {
                await MapDynamicPropertiesToEntityAsync<TDynamicDto, TEntity, TPrimaryKey>(input, entity);
            }

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
        public virtual async Task<GraphQLDataResult<TEntity>> CreateGqlAsync(string properties, TDynamicDto input)
        {
            CheckUpdatePermission();
            var entity = await InternalCreateAsync(input);
            return await QueryAsync(new GetDynamicEntityInput<TPrimaryKey>() { Id = entity.Id, Properties = properties });
        }
    }
}
