using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;
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
    public class EntityProperty: FullAuditedEntity<Guid>
    {
        /// <summary>
        /// Owner entity config
        /// </summary>
        public virtual EntityConfig EntityConfig { get; set; }

        /// <summary>
        /// Property Name
        /// </summary>
        public virtual string Name { get; set; }

        /// <summary>
        /// Label (display name)
        /// </summary>
        [StringLength(300)]
        public virtual string Label { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        [DataType(System.ComponentModel.DataAnnotations.DataType.MultilineText)]
        public virtual string Description { get; set; }

        /// <summary>
        /// Data type
        /// </summary>
        [StringLength(100)]
        public virtual string DataType { get; set; }

        /// <summary>
        /// Data format
        /// </summary>
        [StringLength(100)]
        public virtual string DataFormat { get; set; }

        /// <summary>
        /// Entity type. Aplicable for entity references
        /// </summary>
        [StringLength(300)]
        public virtual string EntityType { get; set; }

        /// <summary>
        /// Reference list name
        /// </summary>
        [StringLength(100)]
        public virtual string ReferenceListName { get; set; }

        /// <summary>
        /// Reference list module
        /// </summary>
        [StringLength(300)]
        public virtual string ReferenceListModule { get; set; }
        
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
        public virtual EntityProperty ParentProperty { get; set; }

        /// <summary>
        /// Child properties (applicable for objects)
        /// </summary>
        [InverseProperty("ParentPropertyId")]
        public virtual IList<EntityProperty> Properties { get; set; }

        /// <summary>
        /// Items type (applicable for arrays)
        /// </summary>
        public virtual EntityProperty ItemsType { get; set; }

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
        public virtual string RegExp { get; set; }

        /// <summary>
        /// Validation message
        /// </summary>
        public virtual string ValidationMessage { get; set; }

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
    }
}
