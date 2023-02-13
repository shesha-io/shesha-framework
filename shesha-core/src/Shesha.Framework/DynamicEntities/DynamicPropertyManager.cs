using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Reflection;
using System.Threading.Tasks;
using Abp.Collections.Extensions;
using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Newtonsoft.Json.Linq;
using NHibernate.Linq;
using Shesha.Configuration.Runtime;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities.Dtos;
using Shesha.Extensions;
using Shesha.Metadata;
using Shesha.Services;
using Shesha.Services.VersionedFields;

namespace Shesha.DynamicEntities
{
    /// inheritedDoc
    public class DynamicPropertyManager : IDynamicPropertyManager, ITransientDependency
    {
        private readonly IRepository<EntityProperty, Guid> _entityPropertyRepository;
        private readonly IRepository<EntityPropertyValue, Guid> _entityPropertyValueRepository;
        private readonly IEntityConfigurationStore _entityConfigurationStore;
        private readonly IDynamicRepository _dynamicRepository;

        public IDynamicDtoTypeBuilder DtoTypeBuilder { get; set; }
        public ISerializationManager SerializationManager { get; set; }

        public DynamicPropertyManager(
            IRepository<EntityProperty, Guid> entityPropertyRepository,
            IRepository<EntityPropertyValue, Guid> entityPropertyValueRepository,
            IEntityConfigurationStore entityConfigurationStore,
            IDynamicRepository dynamicRepository
            )
        {
            _entityPropertyRepository = entityPropertyRepository;
            _entityPropertyValueRepository = entityPropertyValueRepository;
            _entityConfigurationStore = entityConfigurationStore;
            _dynamicRepository = dynamicRepository;
        }

        public async Task<string> GetValueAsync<TId>(IEntity<TId> entity, EntityPropertyDto property)
        {
            var config = entity.GetType().GetEntityConfiguration();

            var result = await _entityPropertyValueRepository.GetAll()
                .Where(x => x.EntityProperty.Id == property.Id && x.OwnerId == entity.Id.ToString() && x.OwnerType == config.TypeShortAlias)
                .OrderByDescending(x => x.CreationTime).FirstOrDefaultAsync();
                
            return result?.Value;
        }

        // todo: get IsVersioned flag from the EntityPropertyDto
        public async Task SetValueAsync<TId>(IEntity<TId> entity, EntityPropertyDto property, string value, bool createNewVersion)
        {
            var config = entity.GetType().GetEntityConfiguration();

            var prop = _entityPropertyValueRepository.GetAll()
                .Where(x => x.EntityProperty.Id == property.Id && x.OwnerId == entity.Id.ToString() &&
                            x.OwnerType == config.TypeShortAlias)
                .OrderByDescending(x => x.CreationTime).FirstOrDefault();

            if (prop?.Value == value) return;

            if (createNewVersion || prop == null)
            {
                prop = new EntityPropertyValue() { Value = value, EntityProperty = _entityPropertyRepository.Get(property.Id) };
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
            Func<IEntity<TId>, TDynamicDto, EntityPropertyDto, PropertyInfo, Task> action)
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

        public async Task<object> GetPropertyAsync(object entity, string propertyName) 
        {
            try 
            {
                if (entity == null)
                    return null;

                var getterMethod = this.GetType().GetMethod(nameof(GetEntityPropertyAsync));
                var entityType = entity.GetType();
                var idType = entityType.GetEntityIdType();

                var genericGetterMethod = getterMethod.MakeGenericMethod(entityType, idType);

                return await (genericGetterMethod.Invoke(this, new object[] { entity, propertyName }) as Task<object>);
            }
            catch (Exception e) 
            {
                throw;
            }
        }

        public async Task<object> GetEntityPropertyAsync<TEntity, TId>(TEntity entity, string propertyName)
            where TEntity : class, IEntity<TId>
        {
            var dynamicProperty = (await DtoTypeBuilder.GetEntityPropertiesAsync(entity.GetType()))
                .FirstOrDefault(p => p.Source == MetadataSourceType.UserDefined && p.Name == propertyName);

            if (dynamicProperty == null)
                return null;

            var serializedValue = await GetValueAsync(entity, dynamicProperty);
            if (serializedValue == null)
                return null;

            Type simpleType = null;
            switch (dynamicProperty.DataType) 
            {
                case DataTypes.EntityReference:
                    {
                        var entityConfig = _entityConfigurationStore.Get(dynamicProperty.EntityType);
                        var id = SerializationManager.DeserializeProperty(entityConfig.IdType, serializedValue);
                        if (id == null)
                            return null;

                        return await _dynamicRepository.GetAsync(entityConfig.EntityType, id.ToString());
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
                                simpleType = typeof(float?);
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