using AutoMapper;
using System;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities.Mapper
{
    /// <summary>
    /// Automapper configurations cache
    /// </summary>
    public interface IDynamicDtoMappingHelper
    {
        /// <summary>
        /// Get entity to DTO mapper
        /// </summary>
        Task<IMapper> GetEntityToDtoMapperAsync(Type entityType, Type dtoType);

        /// <summary>
        /// Get DTO to entity mapper
        /// </summary>
        Task<IMapper> GetDtoToEntityMapperAsync(Type entityType, Type dtoType);
    }
}
