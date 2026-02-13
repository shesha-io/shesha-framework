using Newtonsoft.Json;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities.Enums;
using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Shesha.Metadata.Dtos
{
    /// <summary>
    /// Metadata DTO
    /// </summary>
    public class MetadataDto
    {
        public virtual EntityInitFlags? InitStatus { get; set; }

        public EntityConfigTypes EntityConfigType { get; set; }
        public bool IsExposed { get; set; }

        public string Name { get; set; }

        public string? Label { get; set; }

        public string? Description { get; set; }

        /// <summary>
        /// Data type
        /// </summary>
        public string DataType { get; set; }

        /// <summary>
        /// Module name current model belongs to
        /// </summary>
        public string? Module { get; set; }

        /// <summary>
        /// Type accessor
        /// </summary>
        public string TypeAccessor { get; set; }

        /// <summary>
        /// Module accessor
        /// </summary>
        public string? ModuleAccessor { get; set; }

        /// <summary>
        /// Propeties
        /// </summary>
        public List<PropertyMetadataDto> Properties { get; set; } = new List<PropertyMetadataDto>();

        public List<MethodMetadataDto> Methods { get; set; } = new List<MethodMetadataDto>();

        /// <summary>
        /// Specifications, applicable for entities
        /// </summary>
        public List<SpecificationDto> Specifications { get; set; } = new List<SpecificationDto>();

        /// <summary>
        /// Default API endpoints. 
        /// key - operation name (create/read/update/delete etc.)
        /// value - endpoint DTO (url and http verb)
        /// </summary>
        public Dictionary<string, ApiEndpointDto> ApiEndpoints { get; set; } = new Dictionary<string, ApiEndpointDto>();

        [JsonProperty("md5")]
        [JsonPropertyName("md5")]
        public string? Md5 { get; set; }
        public DateTime? ChangeTime { get; set; }

        /// <summary>
        /// Class name
        /// </summary>
        public string FullClassName { get; set; }

        /// <summary>
        /// Full class name (for backward compatibility)
        /// </summary>
        public List<string> Aliases { get; set; } = new List<string>();

        /// <summary>
        /// Module name parent model belongs to
        /// </summary>
        public string? InheritedFromModule { get; set; }

        /// <summary>
        /// Name of parent model
        /// </summary>
        public string? InheritedFromName { get; set; }

        /// <summary>
        /// Full class name of parent model
        /// </summary>
        public string? InheritedFromFullClassName { get; set; }
    }
}
