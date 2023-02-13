using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Domain.Services;
using Abp.Linq;
using Abp.Reflection;
using Abp.Threading;
using Shesha.Configuration.Runtime;
using Shesha.Domain;
using Shesha.DynamicEntities.Dtos;
using Shesha.Metadata;
using Shesha.Metadata.Dtos;
using Shesha.Permissions;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities
{
    /// inheritedDoc
    public class ModelConfigurationProvider : DomainService, IModelConfigurationProvider, ITransientDependency
    {
        private readonly IRepository<EntityConfig, Guid> _entityConfigRepository;
        private readonly IRepository<EntityProperty, Guid> _entityPropertyRepository;
        private readonly IPermissionedObjectManager _permissionedObjectManager;
        private readonly ITypeFinder _typeFinder;
        private readonly IMetadataProvider _metadataProvider;
        private readonly EntityModelProvider _entityModelProvider;
        
        private readonly IAsyncQueryableExecuter _asyncQueryableExecuter;

        public ModelConfigurationProvider(
            IRepository<EntityConfig, Guid> entityConfigRepository,
            IRepository<EntityProperty, Guid> entityPropertyRepository,
            IPermissionedObjectManager permissionedObjectManager,
            ITypeFinder typeFinder,
            IMetadataProvider metadataProvider,
            EntityModelProvider entityModelProvider,
            IAsyncQueryableExecuter asyncQueryableExecuter
            )
        {
            _entityConfigRepository = entityConfigRepository;
            _entityPropertyRepository = entityPropertyRepository;
            _permissionedObjectManager = permissionedObjectManager;
            _typeFinder = typeFinder;
            _metadataProvider = metadataProvider;
            _entityModelProvider = entityModelProvider;
            _asyncQueryableExecuter = asyncQueryableExecuter;
        }

        public async Task<ModelConfigurationDto> GetModelConfigurationAsync(EntityConfig modelConfig, List<PropertyMetadataDto> hardCodedProps = null)
        {
            var dto = ObjectMapper.Map<ModelConfigurationDto>(modelConfig);

            var properties = await _asyncQueryableExecuter.ToListAsync(
                _entityPropertyRepository.GetAll().Where(p => p.EntityConfig == modelConfig && p.ParentProperty == null)
                .OrderBy(p => p.SortOrder));

            dto.Properties = properties.Select(p => ObjectMapper.Map<ModelPropertyDto>(p)).OrderBy(x => x.SortOrder).ToList();

            var containerType = _typeFinder.Find(x => x.Namespace == modelConfig.Namespace && x.Name == modelConfig.ClassName).FirstOrDefault();

            if (containerType != null)
            {
                hardCodedProps ??= containerType.GetProperties(BindingFlags.Public | BindingFlags.Instance)
                    .Select(p => _metadataProvider.GetPropertyMetadata(p))
                    .OrderBy(e => e.Path)
                    .ToList();

                foreach(var prop in dto.Properties)
                {
                    var hardCodedProp = hardCodedProps.FirstOrDefault(pp => pp.Path == prop.Name);
                    if (hardCodedProp != null)
                    {
                        prop.Suppress = !hardCodedProp.IsVisible || prop.Suppress;
                        prop.Required = hardCodedProp.Required || prop.Required;
                        prop.ReadOnly = hardCodedProp.Readonly || prop.ReadOnly;
                        prop.Audited = hardCodedProp.Audited || prop.Audited;
                        prop.MinLength = hardCodedProp.MinLength ?? prop.MinLength;
                        prop.MaxLength = hardCodedProp.MaxLength ?? prop.MaxLength;
                        prop.Min = hardCodedProp.Min ?? prop.Min;
                        prop.Max = hardCodedProp.Max ?? prop.Max;
                        prop.RegExp = string.IsNullOrWhiteSpace(hardCodedProp.RegExp) ? prop.RegExp : hardCodedProp.RegExp;

                        prop.SuppressHardcoded = !hardCodedProp.IsVisible;
                        prop.RequiredHardcoded = hardCodedProp.Required;
                        prop.ReadOnlyHardcoded = hardCodedProp.Readonly;
                        prop.AuditedHardcoded = hardCodedProp.Audited;
                        prop.SizeHardcoded = hardCodedProp.Min.HasValue
                            || hardCodedProp.Max.HasValue
                            || hardCodedProp.MinLength.HasValue
                            || hardCodedProp.MaxLength.HasValue;
                        prop.RegExpHardcoded = !string.IsNullOrWhiteSpace(hardCodedProp.RegExp);
                    }
                }
            }

            dto.Permission = await _permissionedObjectManager.GetOrCreateAsync($"{modelConfig.Namespace}.{modelConfig.ClassName}", "entity");
            dto.PermissionGet = await _permissionedObjectManager.GetOrCreateAsync($"{modelConfig.Namespace}.{modelConfig.ClassName}@Get", "entity");
            dto.PermissionCreate = await _permissionedObjectManager.GetOrCreateAsync($"{modelConfig.Namespace}.{modelConfig.ClassName}@Create", "entity");
            dto.PermissionUpdate = await _permissionedObjectManager.GetOrCreateAsync($"{modelConfig.Namespace}.{modelConfig.ClassName}@Update", "entity");
            dto.PermissionDelete = await _permissionedObjectManager.GetOrCreateAsync($"{modelConfig.Namespace}.{modelConfig.ClassName}@Delete", "entity");

            dto.NormalizeViewConfigurations(modelConfig);

            return dto;
        }

        public async Task<ModelConfigurationDto> GetModelConfigurationOrNullAsync(string @namespace, string name, List<PropertyMetadataDto> hardCodedProps = null)
        {
            var modelConfig = await _asyncQueryableExecuter.FirstOrDefaultAsync(_entityConfigRepository.GetAll().Where(m => m.ClassName == name && m.Namespace == @namespace));
            if (modelConfig == null)
                return null;

            return await GetModelConfigurationAsync(modelConfig, hardCodedProps);
        }

        public async Task<ModelConfigurationDto> GetModelConfigurationOrNullAsync(Guid id, List<PropertyMetadataDto> hardCodedProps = null)
        {
            var modelConfig = await _asyncQueryableExecuter.FirstOrDefaultAsync(_entityConfigRepository.GetAll().Where(m => m.Id == id));
            if (modelConfig == null)
                return null;

            return await GetModelConfigurationAsync(modelConfig, hardCodedProps);
        }
    }
}
