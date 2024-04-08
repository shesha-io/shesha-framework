using Abp.Application.Services.Dto;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Enums;
using System.Collections.Generic;

namespace Shesha.DynamicEntities.Dtos
{
    /// <summary>
    /// Model property DTO
    /// </summary>
    public class ModelPropertyDto : EntityDto<string>
    {
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
        public string EntityType { get; set; }

        /// <summary>
        /// Module the entity belongs to. Aplicable for entity references
        /// </summary>
        public string EntityModule { get; set; }

        /// <summary>
        /// Type accessor
        /// </summary>
        public string TypeAccessor { get; set; }

        /// <summary>
        /// Module accessor
        /// </summary>
        public string ModuleAccessor { get; set; }

        /// <summary>
        /// Reference list name
        /// </summary>
        public string ReferenceListName { get; set; }

        /// <summary>
        /// Reference list module
        /// </summary>
        public string ReferenceListModule { get; set; }

        /// <summary>
        /// Source type (ApplicationCode = 1, UserDefined = 2)
        /// </summary>
        public MetadataSourceType? Source { get; set; }

        /// <summary>
        /// Default sort order
        /// </summary>
        public int? SortOrder { get; set; }

        /// <summary>
        /// Child properties, applicable for complex data types (e.g. object, array)
        /// </summary>
        public List<ModelPropertyDto> Properties { get; set; } = new List<ModelPropertyDto>();

        /// <summary>
        /// If true, indicates that current property is a framework-related (e.g. <see cref="ISoftDelete.IsDeleted"/>, <see cref="IHasModificationTime.LastModificationTime"/>)
        /// </summary>
        public bool IsFrameworkRelated { get; set; }

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

        public bool SuppressHardcoded { get; set; }

        public bool RequiredHardcoded { get; set; }

        public bool ReadOnlyHardcoded { get; set; }

        public bool AuditedHardcoded { get; set; }

        public bool SizeHardcoded { get; set; }

        public bool RegExpHardcoded { get; set; }

        /// <summary>
        /// Allows to create child/nested entity
        /// </summary>
        public bool CascadeCreateHardcoded { get; set; }

        /// <summary>
        /// Allows to update child/nested entity
        /// </summary>
        public bool CascadeUpdateHardcoded { get; set; }

        /// <summary>
        /// Delete child/nested entity if reference was removed and the child/nested entity doesn't have nother references
        /// </summary>
        public bool CascadeDeleteUnreferencedHardcoded { get; set; }
    }
}
