using Abp.Application.Services.Dto;
using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.ObjectMapping;
using GraphQL;
using GraphQL.Execution;
using Microsoft.AspNetCore.Mvc;
using Shesha.Application.Services;
using Shesha.Application.Services.Dto;
using Shesha.Authorization;
using Shesha.Configuration.Runtime;
using Shesha.Configuration.Runtime.Exceptions;
using Shesha.Domain;
using Shesha.DynamicEntities.Dtos;
using Shesha.Excel;
using Shesha.Reflection;
using Shesha.Settings.Dto;
using Shesha.Specifications;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities
{
    public class EntitiesAppService : SheshaAppServiceBase
    {
        private readonly IEntityConfigurationStore _entityConfigStore;
        private readonly IExcelUtility _excelUtility;
        private readonly IObjectPermissionChecker _objectPermissionChecker;
        private readonly ISpecificationsFinder _specificationsFinder;

        public IObjectMapper AutoMapper { get; set; }

        public EntitiesAppService(
            IEntityConfigurationStore entityConfigStore,
            IExcelUtility excelUtility,
            IObjectPermissionChecker objectPermissionChecker,
            ISpecificationsFinder specificationsFinder
            )
        {
            _entityConfigStore = entityConfigStore;
            _excelUtility = excelUtility;
            _objectPermissionChecker = objectPermissionChecker;
            _specificationsFinder = specificationsFinder;
        }

        protected async Task CheckPermissionAsync(EntityConfiguration entityConfig, string method)
        {
            await _objectPermissionChecker.AuthorizeAsync(false, entityConfig.EntityType.FullName, method, AbpSession.UserId != null);
        }

        [HttpGet]
        public virtual async Task<IDynamicDataResult> GetAsync(string entityType, GetDynamicEntityInput<string> input)
        {
            try
            {
                var entityConfig = _entityConfigStore.Get(entityType);
                if (entityConfig == null)
                    throw new EntityTypeNotFoundException(entityType);

                var typeName = entityConfig.EntityType.FullName;

                //var config = _entityConfigRepository.GetAll().FirstOrDefault(x => (x.Namespace + "." + x.ClassName) == typeName || x.TypeShortAlias == typeName);
                //if (!(config?.GenerateAppService ?? true))
                //    throw new NotSupportedException($"Application service is not configured for entity of type {typeName}");

                var appServiceType = entityConfig.ApplicationServiceType;

                if (entityConfig.ApplicationServiceType == null)
                    throw new NotSupportedException($"{nameof(entityConfig.ApplicationServiceType)} is not set for entity of type {typeName}");

                var appService = IocManager.Resolve(appServiceType) as IEntityAppService;
                if (appService == null)
                    throw new NotImplementedException($"{nameof(IEntityAppService)} is not implemented by type {entityConfig.ApplicationServiceType.FullName}");

                // parse id value to concrete type
                var parsedId = Parser.ParseId(input.Id, entityConfig.EntityType);

                var methodName = nameof(IEntityAppService<Entity<Int64>, Int64>.QueryAsync);
                var method = appService.GetType().GetMethod(methodName);
                if (method == null)
                    throw new NotSupportedException($"{methodName} is missing in the {typeName}");

                await CheckPermissionAsync(entityConfig, methodName);

                // invoke query
                var convertedInputType = typeof(GetDynamicEntityInput<>).MakeGenericType(entityConfig.IdType);
                var convertedInput = Activator.CreateInstance(convertedInputType);
                AutoMapper.Map(input, convertedInput);

                var task = (Task)method.Invoke(appService, new object[] { convertedInput });
                await task.ConfigureAwait(false);

                var resultProperty = task.GetType().GetProperty("Result");
                if (resultProperty == null)
                    throw new Exception("Result property not found");

                var data = resultProperty.GetValue(task) as IDynamicDataResult;
                if (data == null)
                    throw new Exception("Failed to fetch entity");

                return data;
            }
            catch (Exception)
            {
                throw;
            }

        }

        [HttpGet]
        public virtual async Task<IDynamicDataResult> GetAllAsync(string entityType, PropsFilteredPagedAndSortedResultRequestDto input)
        {
            try
            {
                var entityConfig = _entityConfigStore.Get(entityType);
                if (entityConfig == null)
                    throw new EntityTypeNotFoundException(entityType);

                /* we MUST NOT disable it here
                var config = _entityConfigRepository.GetAll().FirstOrDefault(x => (x.Namespace + "." + x.ClassName) == entityConfig.EntityType.FullName);
                if (!(config?.GenerateAppService ?? true))
                    throw new NotSupportedException($"Application service is not configured for entity of type {entityConfig.EntityType.FullName}");
                */

                var appServiceType = entityConfig.ApplicationServiceType;

                if (entityConfig.ApplicationServiceType == null)
                    throw new NotSupportedException($"{nameof(GetAllAsync)} is not implemented for entity of type {entityConfig.EntityType.FullName}");

                var appService = IocManager.Resolve(appServiceType) as IEntityAppService;
                if (appService == null)
                    throw new NotImplementedException($"{nameof(IEntityAppService)} is not implemented by type {entityConfig.ApplicationServiceType.FullName}");

                await CheckPermissionAsync(entityConfig, nameof(IEntityAppService<Entity<Int64>, Int64>.QueryAllAsync));

                return await appService.QueryAllAsync(input);
            }
            catch (Exception)
            {
                throw;
            }
        }

        [HttpPost]
        public async Task<FileStreamResult> ExportToExcel(ExportToExcelInput input, CancellationToken cancellationToken)
        {
            try
            {
                var entityConfig = _entityConfigStore.Get(input.EntityType);
                if (entityConfig == null)
                    throw new EntityTypeNotFoundException(input.EntityType);

                var typeName = entityConfig.EntityType.FullName;

                /* we MUST NOT disable it here
                var config = _entityConfigRepository.GetAll().FirstOrDefault(x => (x.Namespace + "." + x.ClassName) == typeName || x.TypeShortAlias == typeName);
                if (!(config?.GenerateAppService ?? true))
                    throw new NotSupportedException($"Application service is not configured for entity of type {typeName}");
                */

                var appServiceType = entityConfig.ApplicationServiceType;

                if (entityConfig.ApplicationServiceType == null)
                    throw new NotSupportedException($"{nameof(GetAllAsync)} is not implemented for entity of type {typeName}");

                var appService = IocManager.Resolve(appServiceType) as IEntityAppService;
                if (appService == null)
                    throw new NotImplementedException($"{nameof(IEntityAppService)} is not implemented by type {entityConfig.ApplicationServiceType.FullName}");

                var data = await appService.QueryAllAsync(input);

                var rows = ExtractGqlListData(data);

                var stream = await _excelUtility.ReadToExcelStreamAsync(entityConfig.EntityType, rows, input.Columns, "Sheet1");
                stream.Seek(0, SeekOrigin.Begin);

                return new FileStreamResult(stream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            }
            catch (Exception)
            {
                throw;
            }
        }

        private IEnumerable<Dictionary<string, object>> ExtractGqlListData(IDynamicDataResult dataResult)
        {
            var jsonData = (Microsoft.AspNetCore.Mvc.JsonResult)dataResult;
            if (jsonData.Value is ExecutionResult executionResult && executionResult.Data is ExecutionNode executionNode)
            {
                var value = executionNode.ToValue();
                if (executionNode is ObjectExecutionNode objectExecutionNode)
                {
                    if (objectExecutionNode.SubFields != null)
                    {
                        var root = objectExecutionNode.SubFields.FirstOrDefault(); // field itself e.g. '*List'
                        var listResponse = (root as ObjectExecutionNode).SubFields;
                        var itemsFieldName = StringHelper.ToCamelCase(nameof(PagedResultDto<EntityDto<Guid>>.Items));
                        var itemsArray = listResponse.OfType<ArrayExecutionNode>().FirstOrDefault(f => f.Name == itemsFieldName);
                        if (itemsArray != null)
                        {
                            var rows = itemsArray.Items.OfType<ObjectExecutionNode>();
                            return rows.Select(row => row.ToValue() as Dictionary<string, object>);
                        }
                    }
                }
            }
            return null;
        }

        /// <summary>
        /// Get specifications available for the specified entityType
        /// </summary>
        /// <returns></returns>
        public Task<List<SpecificationDto>> SpecificationsAsync(string entityType) 
        {
            var entityConfig = _entityConfigStore.Get(entityType);
            if (entityConfig == null)
                throw new EntityTypeNotFoundException(entityType);

            var specifications = _specificationsFinder.AllSpecifications.Where(s => entityConfig.EntityType.IsAssignableFrom(s.EntityType) /* include base classes */ && !s.IsGlobal).ToList();

            var dtos = specifications.Select(s => new SpecificationDto 
                {
                    Name = s.Name,
                    FriendlyName = s.FriendlyName,
                    Description = s.Description,
                })
                .ToList();

            return Task.FromResult(dtos);
        }

        /// <summary>
        /// Reorder passed list of entities
        /// </summary>
        /// <returns>List of ids with new values of the OrderIndex</returns>
        [HttpPut]
        [ProducesResponseType(typeof(ReorderingItem<Guid, double>), 200)]
        public async Task<IReorderResponse> ReorderAsync(ReorderRequest input)
        {
            var entityConfig = _entityConfigStore.Get(input.EntityType);
            if (entityConfig == null)
                throw new EntityTypeNotFoundException(input.EntityType);

            var property = ReflectionHelper.GetProperty(entityConfig.EntityType, input.PropertyName, true);
            if (property == null)
                throw new ArgumentException($"Property `{input.PropertyName}` not found in the type `{input.EntityType}`");

            var reordererType = typeof(IEntityReorderer<,,>).MakeGenericType(entityConfig.EntityType, entityConfig.IdType, property.PropertyType.GetUnderlyingTypeIfNullable());
            var reorderer = IocManager.Resolve(reordererType) as IEntityReorderer;

            return await reorderer.ReorderAsync(input, property);
        }
    }
}