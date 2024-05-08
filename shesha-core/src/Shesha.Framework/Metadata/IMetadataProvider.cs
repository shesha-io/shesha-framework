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
        Task<MetadataDto> GetAsync(Type containerType, string containerName);

        Task<Dictionary<string, ApiEndpointDto>> GetApiEndpoints(Type containerType);

        /// <summary>
        /// Get specifications available for the specified entityType
        /// </summary>
        /// <returns></returns>
        Task<List<SpecificationDto>> GetSpecificationsAsync(Type entityType);

        Task<List<PropertyMetadataDto>> GetPropertiesAsync(Type containerType, string containerName);
    }
}
