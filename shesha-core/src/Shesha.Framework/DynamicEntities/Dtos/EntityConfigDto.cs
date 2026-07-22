using Abp.Application.Services.Dto;
using Shesha.Configuration.Runtime;
using Shesha.Domain.Enums;
using Shesha.Dto.Interfaces;
using Shesha.Services;
using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Shesha.DynamicEntities.Dtos
{
    /// <summary>
    /// Entity config DTO
    /// </summary>
    public class EntityConfigDto: EntityDto<Guid>, IConfigurationItemDto
    {
        public virtual bool CreatedInDb { get; set; }

        public string? IdColumn { get; set; }

        [MaxLength(255)]
        public string? FriendlyName { get; set; }
        [MaxLength(100)]
        public string? TypeShortAlias { get; set; }

        [MaxLength(255)]
        public string? SchemaName { get; set; }
        [MaxLength(255)]
        public string? TableName { get; set; }
        [MaxLength(500)]
        public string? ClassName { get; set; }
        [MaxLength(500)]
        public string? Namespace { get; set; }
        [MaxLength(255)]
        public string? DiscriminatorValue { get; set; }

        public string? InheritedFromId { get; set; }
        public string? InheritedFrom { get; set; }

        /// <summary>
        /// Source of the entity (code/user)
        /// </summary>
        public MetadataSourceType? Source { get; set; }

        public EntityConfigTypes? EntityConfigType { get; set; }

        public bool GenerateAppService { get; set; }

        // From ConfigurationItem
        public bool Suppress { get; set; }
        public string? Module { get; set; }
        public string Name { get; set; }
        public string? Label { get; set; }

        private bool? _notImplemented;
        public bool NotImplemented => _notImplemented ??=
            Source != MetadataSourceType.UserDefined
            && StaticContext.IocManager.Resolve<IEntityTypeConfigurationStore>().GetOrNull(FullClassName) == null;

        [JsonIgnore]
        public virtual string FullClassName => $"{Namespace}.{ClassName}";

        public Guid? ModuleId { get; set; }
        public string? Description { get; set; }
    }
}
