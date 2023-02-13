using System.Threading.Tasks;
using Abp.Domain.Entities;
using Newtonsoft.Json.Linq;
using Shesha.DynamicEntities.Dtos;

namespace Shesha.DynamicEntities
{
    /// <summary>
    /// Dynamic Property Manager
    /// Provides features to get and set values to dynamic properties of entities and Dtos
    /// </summary>
    public interface IDynamicPropertyManager
    {
        /// <summary>
        /// Get dynamic property value
        /// </summary>
        /// <typeparam name="TId">Type of primary key</typeparam>
        /// <param name="entity">Entity</param>
        /// <param name="property">Property to get value</param>
        /// <returns></returns>
        Task<string> GetValueAsync<TId>(IEntity<TId> entity, EntityPropertyDto property);

        // todo: get IsVersioned flag from the EntityPropertyDto
        /// <summary>
        /// Get dynamic property value
        /// </summary>
        /// <typeparam name="TId">Type of primary key</typeparam>
        /// <param name="entity">Entity</param>
        /// <param name="property">Property to set value</param>
        /// <param name="value">Value</param>
        /// <param name="createNewVersion">True if need to create a new version of value</param>
        /// <returns></returns>
        Task SetValueAsync<TId>(IEntity<TId> entity, EntityPropertyDto property, string value, bool createNewVersion);

        /// <summary>
        /// Map values of dynamic properties from Dto to Entity
        /// </summary>
        /// <typeparam name="TId">Type of primary key</typeparam>
        /// <typeparam name="TDynamicDto">Type of Dto</typeparam>
        /// <typeparam name="TEntity">Type of Entity</typeparam>
        /// <param name="dynamicDto">Dto</param>
        /// <param name="entity">Entity</param>
        /// <returns></returns>
        Task MapDtoToEntityAsync<TDynamicDto, TEntity, TId>(TDynamicDto dynamicDto, TEntity entity)
            where TEntity : class, IEntity<TId>
            where TDynamicDto : class, IDynamicDto<TEntity, TId>;

        /// <summary>
        /// Map values of dynamic properties from JObject to Entity
        /// </summary>
        /// <typeparam name="TId">Type of primary key</typeparam>
        /// <typeparam name="TEntity">Type of Entity</typeparam>
        /// <param name="jObject">Data</param>
        /// <param name="entity">Entity</param>
        /// <returns></returns>
        Task MapJObjectToEntityAsync<TEntity, TId>(JObject jObject, TEntity entity)
            where TEntity : class, IEntity<TId>;

        /// <summary>
        /// Map values of dynamic properties from Entity to Dto
        /// </summary>
        /// <typeparam name="TId">Type of primary key</typeparam>
        /// <typeparam name="TDynamicDto">Type of Dto</typeparam>
        /// <typeparam name="TEntity">Type of Entity</typeparam>
        /// <param name="entity">Entity</param>
        /// <param name="dynamicDto">Dto</param>
        /// <returns></returns>
        Task MapEntityToDtoAsync<TDynamicDto, TEntity, TId>(TEntity entity, TDynamicDto dynamicDto)
            where TEntity : class, IEntity<TId>
            where TDynamicDto : class, IDynamicDto<TEntity, TId>;

        /// <summary>
        /// 
        /// </summary>
        /// <typeparam name="TEntity"></typeparam>
        /// <typeparam name="TId"></typeparam>
        /// <param name="entity"></param>
        /// <param name="propertyName"></param>
        /// <returns></returns>
        Task<object> GetEntityPropertyAsync<TEntity, TId>(TEntity entity, string propertyName)
            where TEntity : class, IEntity<TId>;

        /// <summary>
        /// Get entity property value
        /// </summary>
        /// <param name="entity"></param>
        /// <param name="propertyName"></param>
        /// <returns></returns>
        Task<object> GetPropertyAsync(object entity, string propertyName);
    }
}