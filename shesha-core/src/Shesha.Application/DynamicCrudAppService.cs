using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Runtime.Validation;
using DocumentFormat.OpenXml.Vml.Office;
using FluentValidation;
using NHibernate.Engine;
using NHibernate.Util;
using Nito.AsyncEx.Synchronous;
using Shesha.Application.Services.Dto;
using Shesha.Attributes;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities;
using Shesha.DynamicEntities.Cache;
using Shesha.DynamicEntities.Dtos;
using Shesha.GraphQL.Mvc;
using Shesha.Permissions;
using Shesha.Services;
using Shesha.Utilities;
using Shesha.Validations;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using FluentValidationResult = FluentValidation.Results.ValidationResult;

namespace Shesha
{
    [DynamicControllerNameConvention]
    public class DynamicCrudAppService<TEntity, TDynamicDto, TPrimaryKey> : SheshaCrudServiceBase<TEntity,
        TDynamicDto, TPrimaryKey, FilteredPagedAndSortedResultRequestDto, TDynamicDto, TDynamicDto, GetDynamicEntityInput<TPrimaryKey>>, IDynamicCrudAppService<TEntity, TDynamicDto, TPrimaryKey>, ITransientDependency
        where TEntity : class, IEntity<TPrimaryKey>
        where TDynamicDto : class, IDynamicDto<TEntity, TPrimaryKey>
    {

        private readonly IObjectValidatorManager _objectValidatorManager;

        public DynamicCrudAppService(
            IRepository<TEntity, TPrimaryKey> repository
            // ToDo: AS - temporary
            //IPropertyValidatorManager propertyValidator
            ) : base(repository)
        {
            _objectValidatorManager = Abp.Dependency.IocManager.Instance.Resolve<IObjectValidatorManager>();// propertyValidator;
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

        private async Task<TEntity> InternalUpdateAsync(TDynamicDto input)
        {

            var entity = await Repository.GetAsync(input.Id);

            var jObject = (input as IHasJObjectField)._jObject;

            if (jObject != null)
            {

                // Update the Jobject from the input because it might have changed
                ObjectToJsonExtension.ObjectToJObject(input, jObject);

                var validationResults = new List<ValidationResult>();
                var result = await MapJObjectToStaticPropertiesEntityAsync<TEntity, TPrimaryKey>(jObject, entity, validationResults);

                await _objectValidatorManager.ValidateObject(entity, validationResults);
                await FluentValidationsOnEntityAsync(entity, validationResults);
                Validator.TryValidateObject(entity, new ValidationContext(entity), validationResults);

                await MapJObjectToDynamicPropertiesEntityAsync<TEntity, TPrimaryKey>(jObject, entity, validationResults);

                if (validationResults.Any())
                    throw new AbpValidationException("Please correct the errors and try again", validationResults);
            }
            else
            {
                await MapDynamicDtoToEntityAsync<TDynamicDto, TEntity, TPrimaryKey>(input, entity);

                var validationResults = new List<ValidationResult>();

                await FluentValidationsOnEntityAsync(entity, validationResults);

                if (validationResults.Any<ValidationResult>())
                    throw new AbpValidationException("Please correct the errors and try again", validationResults);

                if (!Validator.TryValidateObject(entity, new ValidationContext(entity), validationResults))
                    throw new AbpValidationException("Please correct the errors and try again", validationResults);
            }

            await Repository.UpdateAsync(entity);

            return entity;
        }

        /// <summary>
        /// Update entity data. 
        /// NOTE: don't use on prod, will be merged with the `Update`endpoint soon
        /// </summary>
        /// <param name="properties">List of properties to fetch in GraphQL-like syntax. Supports nested properties</param>
        /// <param name="input"></param>
        /// <returns></returns>
        /// <response code="200">NOTE: shape of the `result` depends on the `properties` argument. When `properties` argument is not specified - it returns top level properties of the entity, all referenced entities are presented as their Id values</response>
        public virtual async Task<GraphQLDataResult<TEntity>> UpdateGqlAsync(string properties, TDynamicDto input)
        {
            CheckUpdatePermission();
            var entity = await InternalUpdateAsync(input);
            return await QueryAsync(new GetDynamicEntityInput<TPrimaryKey>() { Id = input.Id, Properties = properties });
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

        private async Task<TEntity> InternalCreateAsync(TDynamicDto input)
        {
            var entity = Activator.CreateInstance<TEntity>();

            var jObject = (input as IHasJObjectField)._jObject;

            if (jObject != null)
            {
                var validationResults = new List<ValidationResult>();
                var result = await MapJObjectToStaticPropertiesEntityAsync<TEntity, TPrimaryKey>(jObject, entity, validationResults);

                await _objectValidatorManager.ValidateObject(entity, validationResults);
                await FluentValidationsOnEntityAsync(entity, validationResults);
                Validator.TryValidateObject(entity, new ValidationContext(entity), validationResults);

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
            }

            await Repository.InsertAsync(entity);

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
        /// Runs validation defined on entity through fluentValidation
        /// </summary>
        /// <param name="entity"></param>
        /// <param name="validationResults"></param>
        /// <returns></returns>
        private async Task FluentValidationsOnEntityAsync(TEntity entity, List<ValidationResult> validationResults)
        {
            if (Abp.Dependency.IocManager.Instance.IsRegistered(typeof(IValidator<TEntity>)))
            {
                var validator = Abp.Dependency.IocManager.Instance.Resolve<IValidator<TEntity>>();
                FluentValidationResult fluentValidationResults = await validator.ValidateAsync(entity);

                //Map FluentValidationResult to normal System.ComponentModel.DataAnnotations.ValidationResult,
                //so to throw one same Validations Exceptions on AbpValidationException
                if (!fluentValidationResults.IsValid)
                    fluentValidationResults.Errors.ForEach(err =>
                    {
                        var memberNames = new List<string>() { err.PropertyName };
                        var valResult = new ValidationResult(err.ErrorMessage, memberNames);
                        validationResults.Add(valResult);
                    });
            }
        }

        /// <summary>
        /// Create entity.
        /// NOTE: don't use on prod, will be merged with the `Update`endpoint soon
        /// </summary>
        /// <param name="properties">List of properties to fetch in GraphQL-like syntax. Supports nested properties</param>
        /// <param name="input"></param>
        /// <returns></returns>
        /// <response code="200">NOTE: shape of the `result` depends on the `properties` argument. When `properties` argument is not specified - it returns top level properties of the entity, all referenced entities are presented as their Id values</response>
        public virtual async Task<GraphQLDataResult<TEntity>> CreateGqlAsync(string properties, TDynamicDto input)
        {
            CheckUpdatePermission();
            var entity = await InternalCreateAsync(input);
            return await QueryAsync(new GetDynamicEntityInput<TPrimaryKey>() { Id = input.Id, Properties = properties });
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

        public override async Task<PagedResultDto<TDynamicDto>> GetAllAsync(FilteredPagedAndSortedResultRequestDto input)
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
    }
}
