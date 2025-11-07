using Abp.Application.Services.Dto;
using Newtonsoft.Json.Linq;
using Shesha.Domain.EntityPropertyConfiguration;
using Shesha.Domain.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Shesha.DynamicEntities.Dtos
{
    /// <summary>
    /// Entity property DTO
    /// </summary>
    public class EntityPropertyDto : EntityDto<Guid>
    {
        public virtual bool CreatedInDb { get; set; }

        public string? ColumnName { get; set; }
        public string? InheritedFromId { get; set; }
        public string? InheritedFrom { get; set; }

        /// <summary>
        /// Entity Config Name
        /// </summary>
        public string EntityConfigName { get; set; }
        public string EntityConfigId { get; set; }

        /// <summary>
        /// Property Name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Label (display name)
        /// </summary>
        public string Label { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Data type
        /// </summary>
        public string DataType { get; set; }

        /// <summary>
        /// Data format
        /// </summary>
        public string DataFormat { get; set; }

        /// <summary>
        /// Entity type. Aplicable for entity references
        /// </summary>
        public string EntityFullClassName { get; set; }

        /// <summary>
        /// Entity type. Aplicable for entity references
        /// </summary>
        public string EntityType { get; set; }

        /// <summary>
        /// Entity type. Applicable for entity references
        /// </summary>
        [MaxLength(300)]
        public virtual string? EntityModule { get; set; }

        /// <summary>
        /// Reference list name
        /// </summary>
        public string ReferenceListName { get; set; }

        /// <summary>
        /// Reference list namespace
        /// </summary>
        public string ReferenceListModule { get; set; }

        /// <summary>
        /// Source type (ApplicationCode = 1, UserDefined = 2)
        /// </summary>
        public MetadataSourceType? Source { get; set; }

        /// <summary>
        /// Child properties, applicable for complex data types (e.g. object, array)
        /// </summary>
        public List<EntityPropertyDto> Properties { get; set; } = new List<EntityPropertyDto>();

        /// <summary>
        /// Items type (applicable for arrays)
        /// </summary>
        public EntityPropertyDto ItemsType { get; set; }

        /// <summary>
        /// If true, the property is not returned from Get end-points and is ignored if submitted on Create/Update end-points
        /// The property should also not be listed on the form configurator property list
        /// </summary>
        public bool Suppress { get; set; }

        /// <summary>
        /// Indicates if a property value is required in order to save
        /// </summary>
        public bool Required { get; set; }

        /// <summary>
        /// If true, the property cannot be edited via the dynamically generated create/update end-points:
        /// - property should not be listed on create/update end-points
        /// - should be set to 'True' and not editable for read-only properties of domain classes
        /// </summary>
        public bool ReadOnly { get; set; }

        /// <summary>
        /// Equivalent to Audited attribute on the property
        /// </summary>
        public bool Audited { get; set; }

        /// <summary>
        /// Validation min
        /// </summary>
        public double? Min { get; set; }
        /// <summary>
        /// Validation max
        /// </summary>
        public double? Max { get; set; }

        /// <summary>
        /// Validation min length
        /// </summary>
        public int? MinLength { get; set; }
        /// <summary>
        /// Validation max length
        /// </summary>
        public int? MaxLength { get; set; }

        /// <summary>
        /// Validation RegularExpression 
        /// </summary>
        public string RegExp { get; set; }

        /// <summary>
        /// Validation message
        /// </summary>
        public string ValidationMessage { get; set; }

        /// <summary>
        /// Allows to create child/nested entity
        /// </summary>
        public bool CascadeCreate { get; set; }

        /// <summary>
        /// Allows to update child/nested entity
        /// </summary>
        public bool CascadeUpdate { get; set; }

        /// <summary>
        /// Delete child/nested entity if reference was removed and the child/nested entity doesn't have nother references
        /// </summary>
        public bool CascadeDeleteUnreferenced { get; set; }

        /// <summary>
        /// List configuration and DB mapping
        /// </summary>
        public EntityPropertyListConfiguration ListConfiguration { get; set; }

        /// <summary>
        /// DataType specific formatting
        /// </summary>
        public JObject? Formatting { get; set; }
    }
}
