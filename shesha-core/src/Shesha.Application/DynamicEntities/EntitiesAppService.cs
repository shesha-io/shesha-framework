using Abp.Application.Services.Dto;
using Abp.Domain.Entities;
using Abp.ObjectMapping;
using Abp.UI;
using GraphQL;
using GraphQL.Execution;
using Microsoft.AspNetCore.Mvc;
using Shesha.Application.Services;
using Shesha.Application.Services.Dto;
using Shesha.Authorization;
using Shesha.Configuration.Runtime;
using Shesha.Configuration.Runtime.Exceptions;
using Shesha.DynamicEntities.Dtos;
using Shesha.Excel;
using Shesha.Extensions;
using Shesha.Metadata.Dtos;
using Shesha.Permissions;
using Shesha.Reflection;
using Shesha.Specifications;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities
{
    public class EntitiesAppService : SheshaAppServiceBase
    {
        private readonly IEntityTypeConfigurationStore _entityConfigStore;
        private readonly IExcelUtility _excelUtility;
        private readonly IObjectPermissionChecker _objectPermissionChecker;
        private readonly ISpecificationsFinder _specificationsFinder;

        public IObjectMapper AutoMapper { get; set; }

        public EntitiesAppService(
            IEntityTypeConfigurationStore entityConfigStore,
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

        protected async Task CheckPermissionAsync(EntityTypeConfiguration entityConfig, string method)
        {
            var crudMethod = PermissionedObjectManager.GetCrudMethod(method, method);
            await _objectPermissionChecker.AuthorizeAsync(false, entityConfig.EntityType.GetRequiredFullName(), crudMethod.NotNull(), ShaPermissionedObjectsTypes.EntityAction, AbpSession.UserId != null);
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
                var convertedInputType = typeof(GetDynamicEntityInput<>).MakeGenericType(entityConfig.IdType) ?? throw new Exception($"Failed to create generic type '{typeof(GetDynamicEntityInput<>).FullName}', id type: '{entityConfig.IdType.FullName}'");
                var convertedInput = Activator.CreateInstance(convertedInputType) ?? throw new Exception($"Failed to create instance of type '{convertedInputType.FullName}'");
                AutoMapper.Map(input, convertedInput);

                var task = method.Invoke<Task>(appService, [convertedInput]).NotNull();
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
        public async Task<FileStreamResult> ExportToExcelAsync(ExportToExcelInput input, CancellationToken cancellationToken)
        {
            try
            {
                var entityConfig = _entityConfigStore.Get(input.EntityType);
                if (entityConfig == null)
                    throw new EntityTypeNotFoundException(input.EntityType);

                var typeName = entityConfig.EntityType.FullName;

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

        private IEnumerable<Dictionary<string, object?>> ExtractGqlListData(IDynamicDataResult dataResult)
        {
            var jsonData = (JsonResult)dataResult;
            if (jsonData.Value is ExecutionResult executionResult && executionResult.Data is ExecutionNode executionNode)
            {
                var value = executionNode.ToValue();
                if (executionNode is ObjectExecutionNode objectExecutionNode)
                {
                    if (objectExecutionNode.SubFields != null)
                    {
                        var root = objectExecutionNode.SubFields.FirstOrDefault(); // field itself e.g. '*List'
                        var listResponse = root is ObjectExecutionNode rootExecutionNode
                            ? rootExecutionNode.SubFields
                            : null;
                        if (listResponse != null) 
                        {
                            var itemsFieldName = StringHelper.ToCamelCase(nameof(PagedResultDto<EntityDto<Guid>>.Items));
                            var itemsArray = listResponse.OfType<ArrayExecutionNode>().Single(f => f.Name == itemsFieldName);
                            if (itemsArray != null && itemsArray.Items != null)
                            {
                                var rows = itemsArray.Items.OfType<ObjectExecutionNode>();
                                return rows != null
                                    ? rows.Select(row => row.ToValue() as Dictionary<string, object?>).WhereNotNull()
                                    : [];
                            }
                        }                        
                    }
                }
            }
            return [];
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

            if (input.Items.Any(i => i.OrderIndex == null))
                throw new UserFriendlyException("Items should use valid non empty order indexes");

            if (input.Items.All(i => i.OrderIndex == 0))
                throw new UserFriendlyException("Reordering is not available for enon ordered items");

            var reordererType = typeof(IEntityReorderer<,,>).MakeGenericType(entityConfig.EntityType, entityConfig.IdType, property.PropertyType.GetUnderlyingTypeIfNullable());
            var reorderer = IocManager.Resolve(reordererType).ForceCastAs<IEntityReorderer>();

            return await reorderer.ReorderAsync(input, property);
        }
    }
}