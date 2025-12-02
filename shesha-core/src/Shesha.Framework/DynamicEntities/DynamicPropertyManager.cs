using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Newtonsoft.Json.Linq;
using Shesha.Configuration.Runtime;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities.Dtos;
using Shesha.Extensions;
using Shesha.Metadata;
using Shesha.Reflection;
using Shesha.Services;
using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Reflection;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities
{
    /// inheritedDoc
    public class DynamicPropertyManager : IDynamicPropertyManager, ITransientDependency
    {
        private readonly IRepository<EntityProperty, Guid> _entityPropertyRepository;
        private readonly IRepository<EntityPropertyValue, Guid> _entityPropertyValueRepository;
        private readonly IEntityTypeConfigurationStore _entityConfigurationStore;
        private readonly IDynamicRepository _dynamicRepository;

        public IDynamicDtoTypeBuilder DtoTypeBuilder { get; set; }
        public ISerializationManager SerializationManager { get; set; }

        public DynamicPropertyManager(
            IRepository<EntityProperty, Guid> entityPropertyRepository,
            IRepository<EntityPropertyValue, Guid> entityPropertyValueRepository,
            IEntityTypeConfigurationStore entityConfigurationStore,
            IDynamicRepository dynamicRepository
            )
        {
            _entityPropertyRepository = entityPropertyRepository;
            _entityPropertyValueRepository = entityPropertyValueRepository;
            _entityConfigurationStore = entityConfigurationStore;
            _dynamicRepository = dynamicRepository;
        }

        public async Task<string?> GetValueAsync<TId>(IEntity<TId> entity, EntityPropertyDto property) where TId : notnull
        {
            var config = entity.GetType().GetEntityConfiguration();

            var result = await _entityPropertyValueRepository.GetAll()
                .Where(x => x.EntityProperty.Id == property.Id && x.OwnerId == entity.Id.ToString() && x.OwnerType == config.TypeShortAlias)
                .OrderByDescending(x => x.CreationTime).FirstOrDefaultAsync();
                
            return result?.Value;
        }

        // todo: get IsVersioned flag from the EntityPropertyDto
        public async Task SetValueAsync<TId>(IEntity<TId> entity, EntityPropertyDto property, string value, bool createNewVersion) where TId: notnull
        {
            var config = entity.GetType().GetEntityConfiguration();

            var prop = await _entityPropertyValueRepository
                .GetAll()
                .Where(x => x.EntityProperty.Id == property.Id && x.OwnerId == entity.Id.ToString() &&
                            x.OwnerType == config.TypeShortAlias)
                .OrderByDescending(x => x.CreationTime)
                .FirstOrDefaultAsync();

            if (prop?.Value == value) return;

            if (createNewVersion || prop == null)
            {
                prop = new EntityPropertyValue() { 
                    Value = value, 
                    EntityProperty = await _entityPropertyRepository.GetAsync(property.Id) 
                };
                prop.SetOwner(entity);
            }
            else
            {
                prop.Value = value;
            }

            await _entityPropertyValueRepository.InsertOrUpdateAsync(prop);
        }

        public async Task MapDtoToEntityAsync<TDynamicDto, TEntity, TId>(TDynamicDto dynamicDto, TEntity entity)
            where TEntity : class, IEntity<TId>
            where TDynamicDto : class, IDynamicDto<TEntity, TId>
            where TId : notnull
        {
            await MapPropertiesAsync(entity, dynamicDto, async (ent, dto, entProp, dtoProp) =>
            {
                var rawValue = dtoProp.GetValue(dto);
                var convertedValue = SerializationManager.SerializeProperty(entProp, rawValue);
                await SetValueAsync(entity, entProp, convertedValue, false);
            });
        }

        public async Task MapEntityToDtoAsync<TDynamicDto, TEntity, TId>(TEntity entity, TDynamicDto dynamicDto)
            where TEntity : class, IEntity<TId>
            where TDynamicDto : class, IDynamicDto<TEntity, TId>
            where TId : notnull
        {
            await MapPropertiesAsync(entity, dynamicDto, async (ent, dto, entProp, dtoProp) =>
            {
                var serializedValue = await GetValueAsync(entity, entProp);
                var rawValue = serializedValue != null
                    ? SerializationManager.DeserializeProperty(dtoProp.PropertyType, serializedValue)
                    : null;
                dtoProp.SetValue(dto, rawValue);
            });
        }

        public async Task MapPropertiesAsync<TId, TDynamicDto>(IEntity<TId> entity, TDynamicDto dto, 
            Func<IEntity<TId>, TDynamicDto, EntityPropertyDto, PropertyInfo, Task> action) where TDynamicDto: notnull
        {
            var dynamicProperties = (await DtoTypeBuilder.GetEntityPropertiesAsync(entity.GetType()))
                .Where(p => p.Source == MetadataSourceType.UserDefined).ToList();
            var dtoProps = dto.GetType().GetProperties();
            foreach (var property in dynamicProperties)
            {
                var dtoProp = dtoProps.FirstOrDefault(p => p.Name == property.Name);
                if (dtoProp != null)
                {
                    await action(entity, dto, property, dtoProp);
                }
            }
        }

        public async Task MapJObjectToEntityAsync<TEntity, TId>(JObject jObject, TEntity entity)
            where TEntity : class, IEntity<TId>
            where TId : notnull
        {
            var dynamicProperties = (await DtoTypeBuilder.GetEntityPropertiesAsync(entity.GetType()))
                .Where(p => p.Source == MetadataSourceType.UserDefined).ToList();
            var dtoProps = jObject.Properties();
            foreach (var property in dynamicProperties)
            {
                var dtoProp = dtoProps.FirstOrDefault(p => p.Name == property.Name);
                if (dtoProp != null)
                {
                    var rawValue = dtoProp.Value.ToString();
                    var convertedValue = SerializationManager.SerializeProperty(property, rawValue);
                    await SetValueAsync(entity, property, convertedValue, false);
                }
            }
        }

        public async Task<object?> GetPropertyAsync(object entity, string propertyName) 
        {
            try 
            {
                if (entity == null)
                    return null;

                var getterMethod = this.GetType().GetRequiredMethod(nameof(GetEntityPropertyAsync));
                var entityType = entity.GetType();
                var idType = entityType.GetEntityIdType();

                var genericGetterMethod = getterMethod.MakeGenericMethod(entityType, idType);

                var result = genericGetterMethod.Invoke(this, [entity, propertyName]).ForceCastAs<Task<object>>();
                return await result;
            }
            catch (Exception) 
            {
                throw;
            }
        }

        public async Task<object?> GetEntityPropertyAsync<TEntity, TId>(TEntity entity, string propertyName)
            where TEntity : class, IEntity<TId>
            where TId : notnull
        {
            var dynamicProperty = (await DtoTypeBuilder.GetEntityPropertiesAsync(entity.GetType()))
                .FirstOrDefault(p => p.Source == MetadataSourceType.UserDefined && p.Name == propertyName);

            if (dynamicProperty == null)
                return null;

            var serializedValue = await GetValueAsync(entity, dynamicProperty);
            if (serializedValue == null)
                return null;

            Type? simpleType = null;
            switch (dynamicProperty.DataType) 
            {
                case DataTypes.EntityReference:
                    {
                        var entityConfig = _entityConfigurationStore.Get(dynamicProperty.EntityFullClassName);
                        var id = SerializationManager.DeserializeProperty(entityConfig.IdType.NotNull(), serializedValue);
                        var stringId = id?.ToString();
                        if (string.IsNullOrWhiteSpace(stringId))
                            return null;

                        return await _dynamicRepository.GetAsync(entityConfig.EntityType, stringId);
                    }
                case DataTypes.Boolean:
                    simpleType = typeof(bool?);
                    break;
                case DataTypes.Guid:
                    simpleType = typeof(Guid?);
                    break;
                case DataTypes.String:
                    simpleType = typeof(string);
                    break;
                case DataTypes.Date:
                case DataTypes.DateTime:
                    simpleType = typeof(DateTime?);
                    break;
                case DataTypes.Number:
                    {
                        switch (dynamicProperty.DataFormat) 
                        {
                            case NumberFormats.Int32:
                                simpleType = typeof(int?);
                                break;
                            case NumberFormats.Int64:
                                simpleType = typeof(Int64?);
                                break;
                            case NumberFormats.Double:
                                simpleType = typeof(double?);
                                break;
                            case NumberFormats.Float:
                                simpleType = typeof(double?);
                                break;
                        }
                        break;
                    }
                case DataTypes.Time:
                    simpleType = typeof(TimeSpan?);
                    break;
                case DataTypes.Object:
                    simpleType = await DtoTypeBuilder.GetDtoPropertyTypeAsync(dynamicProperty, new DynamicDtoTypeBuildingContext());
                    break;
            }

            var rawValue = serializedValue != null && simpleType != null
                ? SerializationManager.DeserializeProperty(simpleType, serializedValue)
                : null;

            return rawValue;
        }
    }
}