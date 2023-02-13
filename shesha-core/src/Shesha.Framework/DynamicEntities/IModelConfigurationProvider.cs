using Shesha.Domain;
using Shesha.DynamicEntities.Dtos;
using Shesha.Metadata.Dtos;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities
{
    /// <summary>
    /// Model Configuration Provider. Provides an access to the configurable models and properties
    /// </summary>
    public interface IModelConfigurationProvider
    {
        /// <summary>
        /// Get model configuration
        /// </summary>
        Task<ModelConfigurationDto> GetModelConfigurationAsync(EntityConfig modelConfig, List<PropertyMetadataDto> hardCodedProps = null);

        /// <summary>
        /// Get model configuration
        /// </summary>
        Task<ModelConfigurationDto> GetModelConfigurationOrNullAsync(string @namespace, string name, List<PropertyMetadataDto> hardCodedProps = null);
    }
}
