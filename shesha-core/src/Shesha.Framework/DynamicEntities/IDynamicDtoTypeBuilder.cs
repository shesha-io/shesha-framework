using Shesha.DynamicEntities.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities
{
    /// <summary>
    /// Dynamic DTO builder
    /// </summary>
    public interface IDynamicDtoTypeBuilder
    {
        ///// <summary>
        ///// Create instance of the <see cref="IDynamicDto{TEntity, TId}"/>
        ///// </summary>
        ///// <param name="dtoType">Type of the DTO</param>
        ///// <returns></returns>
        //Task<object> CreateDtoInstanceAsync(Type dtoType);

        /// <summary>
        /// Build proxy type for the DTO
        /// </summary>
        Task<Type> BuildDtoProxyTypeAsync(DynamicDtoTypeBuildingContext context);

        /// <summary>
        /// Build full proxy type for the specified DTO. Full proxy contains all configurable fields and service fields (e.g. <see cref="IHasFormFieldsList._formFields"/> property)
        /// </summary>
        /// <param name="baseType">DTO type</param>
        /// <returns></returns>
        Task<Type> BuildDtoFullProxyTypeAsync(Type baseType, DynamicDtoTypeBuildingContext context);

        /// <summary>
        /// Get properties of the specified dynamic entity
        /// </summary>
        /// <param name="entityType">Type of entity</param>
        /// <returns></returns>
        Task<List<EntityPropertyDto>> GetEntityPropertiesAsync(Type entityType);

        /// <summary>
        /// Returns .Net type that is used to store data for the specified DTO property (according to the property settings)
        /// </summary>
        Task<Type> GetDtoPropertyTypeAsync(EntityPropertyDto propertyDto, DynamicDtoTypeBuildingContext context);
    }
}
