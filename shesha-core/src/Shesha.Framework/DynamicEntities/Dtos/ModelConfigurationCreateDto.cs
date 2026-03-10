using Abp.Application.Services.Dto;
using Shesha.Domain;
using Shesha.Domain.Enums;
using System;
using System.Collections.Generic;

namespace Shesha.DynamicEntities.Dtos
{
    /// <summary>
    /// Create model configuration DTO
    /// </summary>
    public class ModelConfigurationCreateDto : EntityDto<Guid?>
    {
        public EntityConfigTypes EntityConfigType { get; set; }

        public EntityTypeIdentifier? InheritedFromId { get; set; }
        public string? InheritedFromClassName { get; set; }
        public string? InheritedFromNamespace { get; set; }

        // ConfigurationItem
        public Guid? FolderId { get; set; }
        public Guid? ModuleId { get; set; }
        public string? Module { get; set; }
        public string Name { get; set; }
        public string? Label { get; set; }
        public string? Description { get; set; }

        public List<ModelPropertyDto> Properties { get; set; } = new List<ModelPropertyDto>();
        public List<EntityViewConfigurationDto> ViewConfigurations { get; set; } = new List<EntityViewConfigurationDto>();
    }
}
