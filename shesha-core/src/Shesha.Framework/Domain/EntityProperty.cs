using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Newtonsoft.Json.Linq;
using Shesha.Domain.Attributes;
using Shesha.Domain.EntityPropertyConfiguration;
using Shesha.Domain.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    /// <summary>
    /// Configuration of the entity property
    /// </summary>
    [Entity(TypeShortAlias = "Shesha.Framework.EntityProperty", GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService)]
    [SnakeCaseNaming]
    [Table("entity_properties", Schema = "frwk")]
    public class EntityProperty: FullAuditedEntity<Guid>
    {
        public virtual bool CreatedInDb { get; set; }

        /// <summary>
        /// Entity Config Revision
        /// Name of column in the DB
        /// </summary>
        public virtual string? ColumnName { get; set; }

        /// <summary>
        /// If Inherited from other property
        /// </summary>
        public virtual EntityProperty? InheritedFrom { get; set; }

        /// <summary>
        /// Owner entity config
        /// </summary>
        public required virtual EntityConfig EntityConfig { get; set; }

        /// <summary>
        /// Property Name
        /// </summary>
        public virtual string Name { get; set; } = default!;

        /// <summary>
        /// Label (display name)
        /// </summary>
        [MaxLength(300)]
        public virtual string? Label { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        [DataType(System.ComponentModel.DataAnnotations.DataType.MultilineText)]
        public virtual string? Description { get; set; }

        /// <summary>
        /// Data type
        /// </summary>
        [MaxLength(100)]
        public virtual string? DataType { get; set; }

        /// <summary>
        /// Data format
        /// </summary>
        [MaxLength(100)]
        public virtual string? DataFormat { get; set; }

        /// <summary>
        /// Entity type. Applicable for entity references
        /// </summary>
        [MaxLength(300)]
        public virtual string? EntityType { get; set; }

        /// <summary>
        /// Reference list name
        /// </summary>
        [MaxLength(100)]
        public virtual string? ReferenceListName { get; set; }

        /// <summary>
        /// Reference list module
        /// </summary>
        [MaxLength(300)]
        public virtual string? ReferenceListModule { get; set; }

        /// <summary>
        /// Source of the property (code/user)
        /// </summary>
        public virtual MetadataSourceType? Source { get; set; }

        /// <summary>
        /// Default sort order
        /// </summary>
        public virtual int? SortOrder { get; set; }

        /// <summary>
        /// Parent property
        /// </summary>
        public virtual EntityProperty? ParentProperty { get; set; }

        /// <summary>
        /// Child properties (applicable for objects)
        /// </summary>
        [InverseProperty("parent_property_id")]
        public virtual IList<EntityProperty> Properties { get; set; } = new List<EntityProperty>();

        /// <summary>
        /// Items type (applicable for arrays)
        /// </summary>
        public virtual EntityProperty? ItemsType { get; set; }

        /// <summary>
        /// If true, indicates that current property is a framework-related (e.g. <see cref="ISoftDelete.IsDeleted"/>, <see cref="IHasModificationTime.LastModificationTime"/>)
        /// </summary>
        public virtual bool IsFrameworkRelated { get; set; }

        public EntityProperty()
        {
            // set to user-defined by default, `ApplicationCode` is used in the bootstrapper only
            Source = MetadataSourceType.UserDefined;
        }

        /// <summary>
        /// If true, the property is not returned from Get end-points and is ignored if submitted on Create/Update end-points
        /// The property should also not be listed on the form configurator property list
        /// </summary>
        public virtual bool Suppress { get; set; }

        /// <summary>
        /// Indicates if a property value is required in order to save
        /// </summary>
        public virtual bool Required { get; set; }

        /// <summary>
        /// If true, the property cannot be edited via the dynamically generated create/update end-points:
        /// - property should not be listed on create/update end-points
        /// - should be set to 'True' and not editable for read-only properties of domain classes
        /// </summary>
        public virtual bool ReadOnly { get; set; }

        /// <summary>
        /// Equivalent to Audited attribute on the property
        /// </summary>
        public virtual bool Audited { get; set; }

        /// <summary>
        /// Validation min
        /// </summary>
        public virtual double? Min { get; set; }
        /// <summary>
        /// Validation max
        /// </summary>
        public virtual double? Max { get; set; }

        /// <summary>
        /// Validation min length
        /// </summary>
        public virtual int? MinLength { get; set; }
        /// <summary>
        /// Validation max length
        /// </summary>
        public virtual int? MaxLength { get; set; }

        /// <summary>
        /// Validation RegularExpression 
        /// </summary>
        public virtual string? RegExp { get; set; }

        /// <summary>
        /// Validation message
        /// </summary>
        public virtual string? ValidationMessage { get; set; }

        /// <summary>
        /// Allows to create child/nested entity
        /// </summary>
        public virtual bool CascadeCreate { get; set; }

        /// <summary>
        /// Allows to update child/nested entity
        /// </summary>
        public virtual bool CascadeUpdate { get; set; }

        /// <summary>
        /// Delete child/nested entity if reference was removed and the child/nested entity doesn't have nother references
        /// </summary>
        public virtual bool CascadeDeleteUnreferenced { get; set; }

        /// <summary>
        /// List configuration and DB mapping
        /// </summary>
        [SaveAsJson]
        public virtual EntityPropertyListConfiguration? ListConfiguration { get; set; }

        /// <summary>
        /// DataType specific formatting
        /// </summary>
        [SaveAsJson]
        public virtual JObject? Formatting { get; set; }

        public override string ToString()
        {
            return $"{Name} {DataType} ({DataFormat} {EntityType})";
        }
    }
}