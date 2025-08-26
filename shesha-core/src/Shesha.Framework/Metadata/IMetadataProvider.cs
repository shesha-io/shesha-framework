using Shesha.Metadata.Dtos;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.Metadata
{
    /// <summary>
    /// Metadata provider
    /// </summary>
    public interface IMetadataProvider
    {
        Task<MetadataDto> GetAsync(Type containerType);

        Task<MetadataDto> GetAsync(string? moduleName, string container);

        Task<Dictionary<string, ApiEndpointDto>> GetApiEndpointsAsync(Type containerType);

        /// <summary>
        /// Get specifications available for the specified entityType
        /// </summary>
        /// <returns></returns>
        Task<List<SpecificationDto>> GetSpecificationsAsync(Type entityType);

        Task<List<PropertyMetadataDto>> GetPropertiesAsync(Type containerType);

        /// <summary>
        /// Get list of all models available in the application
        /// </summary>
        /// <returns></returns>
        Task<List<ModelDto>> GetAllModelsAsync();

        /// <summary>
        /// Get type of container by name
        /// </summary>
        Task<Type> GetContainerTypeAsync(string? moduleName, string container);

        /// <summary>
        /// Get type of container by name
        /// </summary>
        Task<Type?> GetContainerTypeOrNullAsync(string? moduleName, string container);
    }
}
