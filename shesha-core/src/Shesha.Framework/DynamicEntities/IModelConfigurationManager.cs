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
    /// Model Configuration Manager. Provides an access to the configurable models and properties
    /// </summary>
    public interface IModelConfigurationManager
    {
        /// <summary>
        /// Merge entity configurations
        /// </summary>
        /// <param name="source">Source configuration</param>
        /// <param name="destination">Destination configuration</param>
        /// <param name="deleteAfterMerge">Delete source configuration after merge</param>
        /// <param name="deepUpdate">Set to true to update all references from the source class name to the destination class name (properties, JsonEntities, etc)</param>
        /// <returns></returns>
        Task MergeConfigurationsAsync(EntityConfig source, EntityConfig destination, bool deleteAfterMerge, bool deepUpdate);

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
