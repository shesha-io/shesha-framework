using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Newtonsoft.Json;
using Shesha.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Shesha.Metadata.Dtos
{
    public class PropertyMetadataDto
    {
        public bool? CascadeCreate { get; set; }
        public bool? CascadeUpdate { get; set; }
        public bool? CascadeDeleteUnreferenced { get; set; }

        public bool IsVisible { get; set; }
        public bool Required { get; set; }
        public bool Readonly { get; set; }
        public int? MinLength { get; set; }
        public int? MaxLength { get; set; }

        public double? Min { get; set; }
        public double? Max { get; set; }

        /// <summary>
        /// Equivalent to Audited attribute on the property
        /// </summary>
        public bool Audited { get; set; }

        /// <summary>
        /// Validation RegularExpression 
        /// </summary>
        public string RegExp { get; set; }

        /// <summary>
        /// Validation message
        /// </summary>
        public virtual string ValidationMessage { get; set; }

        public string Path { get; set; }
        public string Label { get; set; }
        public string Description { get; set; }

        public string DataType { get; set; }
        public string DataFormat { get; set; }

        /// <summary>
        /// Type of the entity. Applicable when DataType = <seealso cref="DataTypes.EntityReference"/>
        /// </summary>
        [JsonProperty("entityType")]
        [JsonPropertyName("entityType")]
        public string EntityType { get; set; }

        /// <summary>
        /// Module the entity belongs to. Applicable when DataType = <seealso cref="DataTypes.EntityReference"/>
        /// </summary>
        public string EntityModule { get; set; }

        public string TypeAccessor { get; set; }
        public string ModuleAccessor { get; set; }

        [Newtonsoft.Json.JsonIgnore]
        [System.Text.Json.Serialization.JsonIgnore]
        public Type EnumType { get; set; }

        public string ReferenceListName { get; set; }
        public string ReferenceListModule { get; set; }
        public int OrderIndex { get; set; }
        public string GroupName { get; set; }

        /// <summary>
        /// If true, indicates that current property is a framework-related (e.g. <see cref="ISoftDelete.IsDeleted"/>, <see cref="IHasModificationTime.LastModificationTime"/>)
        /// </summary>
        public bool IsFrameworkRelated { get; set; }

        /// <summary>
        /// If true, indicates that the property is filterable
        /// </summary>
        public bool IsFilterable { get; set; }

        /// <summary>
        /// If true, indicates that the property is sortable
        /// </summary>
        public bool IsSortable { get; set; }

        /// <summary>
        /// Child properties (applicable for complex objects)
        /// </summary>
        public List<PropertyMetadataDto> Properties { get; set; } = new List<PropertyMetadataDto>();

        /// <summary>
        /// Items type (applicable for arrays)
        /// </summary>
        public PropertyMetadataDto ItemsType { get; set; }

        public MetadataSourceType Source { get; set; }

        /// <summary>
        /// If true, indicates that the property is nullable
        /// </summary>
        public bool IsNullable { get; set; }
    }
}
