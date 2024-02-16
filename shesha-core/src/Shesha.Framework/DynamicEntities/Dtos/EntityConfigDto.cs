using Abp.Application.Services.Dto;
using Abp.Dependency;
using Shesha.Configuration.Runtime;
using Shesha.Domain.ConfigurationItems;
using Shesha.Domain.Enums;
using Shesha.Dto.Interfaces;
using Shesha.Services;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;
using System.Text.Json.Serialization;

namespace Shesha.DynamicEntities.Dtos
{
    /// <summary>
    /// Entity config DTO
    /// </summary>
    public class EntityConfigDto: EntityDto<Guid>, IConfigurationItemDto
    {
        [StringLength(255)]
        public string FriendlyName { get; set; }
        [StringLength(100)]
        public string TypeShortAlias { get; set; }
        [StringLength(255)]
        public string TableName { get; set; }
        [StringLength(500)]
        public string ClassName { get; set; }
        [StringLength(500)]
        public string Namespace { get; set; }
        [StringLength(255)]
        public string DiscriminatorValue { get; set; }

        /// <summary>
        /// Source of the entity (code/user)
        /// </summary>
        public MetadataSourceType? Source { get; set; }

        public virtual EntityConfigTypes? EntityConfigType { get; set; }

        public virtual bool GenerateAppService { get; set; }

        // From ConfigurationItem
        public bool Suppress { get; set; }
        public string Module { get; set; }
        public string Name { get; set; }
        public string Label { get; set; }

        private bool? _notImplemented;
        public bool NotImplemented => _notImplemented ??=
            Source != MetadataSourceType.UserDefined
            && StaticContext.IocManager.Resolve<IEntityConfigurationStore>().GetOrNull(FullClassName) == null;

        [JsonIgnore]
        public virtual string FullClassName => $"{Namespace}.{ClassName}";

        public Guid? ModuleId { get; set; }
        public string Description { get; set; }
        public int VersionNo { get; set; }
        public ConfigurationItemVersionStatus VersionStatus { get; set; }
    }
}
