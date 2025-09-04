using Shesha.Domain;
using Shesha.DynamicEntities.Dtos;
using Shesha.Metadata.Dtos;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities
{
    /// <summary>
    /// Model Configuration Manager. Provides an access to the configurable models and properties
    /// </summary>
    public interface IModelConfigurationManager
    {
        /// <summary>
        /// Get model configuration
        /// </summary>
        Task<ModelConfigurationDto?> GetModelConfigurationOrNullAsync(EntityConfig modelConfig, List<PropertyMetadataDto>? hardCodedProps = null);

        /// <summary>
        /// Get model configuration
        /// </summary>
        Task<ModelConfigurationDto?> GetCachedModelConfigurationOrNullAsync(string @namespace, string className, List<PropertyMetadataDto>? hardCodedProps = null);

        /// <summary>
        /// Get model configuration
        /// </summary>
        Task<ModelConfigurationDto> GetCachedModelConfigurationAsync(string @namespace, string className, List<PropertyMetadataDto>? hardCodedProps = null);

        /// <summary>
        /// Create model configuration
        /// </summary>
        /// <param name="input">Model configuration Dto</param>
        /// <returns></returns>
        Task<ModelConfigurationDto> CreateAsync(ModelConfigurationCreateDto input);

        /// <summary>
        /// Update model configuration
        /// </summary>
        /// <param name="input">Model configuration Dto</param>
        /// <returns></returns>
        Task<ModelConfigurationDto> UpdateAsync(ModelConfigurationDto input);
    }
}
