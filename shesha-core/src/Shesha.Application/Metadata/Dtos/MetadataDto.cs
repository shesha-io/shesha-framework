using Newtonsoft.Json;
using Shesha.DynamicEntities.Dtos;
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
        /// <summary>
        /// Data type
        /// </summary>
        public string DataType { get; set; }

        /// <summary>
        /// Module name current model belongs to
        /// </summary>
        public string Module { get; set; }

        /// <summary>
        /// Type accessor
        /// </summary>
        public string TypeAccessor { get; set; }

        /// <summary>
        /// Module accessor
        /// </summary>
        public string ModuleAccessor { get; set; }

        /// <summary>
        /// Propeties
        /// </summary>
        public List<PropertyMetadataDto> Properties { get; set; } = new List<PropertyMetadataDto>();

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
        public string MD5 { get; set; }
        public DateTime? ChangeTime { get; set; }

        /// <summary>
        /// Class name
        /// </summary>
        public string ClassName { get; set; }

        /// <summary>
        /// Full class name (for backward compatibility)
        /// </summary>
        public List<string> Aliases { get; set; } = new List<string>();
    }
}
