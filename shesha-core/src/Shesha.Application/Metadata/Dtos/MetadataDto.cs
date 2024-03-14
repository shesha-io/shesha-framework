using Shesha.DynamicEntities.Dtos;
using System.Collections.Generic;

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
    }
}
