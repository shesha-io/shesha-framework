using System;
using System.Linq;
using System.Reflection;
using Abp.Dependency;
using Shesha.Services;

namespace Shesha.Configuration.Runtime
{
    /// <summary>
    /// Provides Metadata/Configuration information for Entity properties
    /// </summary>
    public class PropertyConfiguration
    {
        /// <summary>
        /// If true, indicates that referencelist items should be sorted by name.
        /// </summary>
        public bool ReferenceListOrderByName { get; set; }

        /// <summary>
        /// If the property is a ReferenceList, gets or sets the name of the reference list.
        /// </summary>
        public string ReferenceListName { get; set; }

        /// <summary>
        /// If the property is a ReferenceList, gets or sets the module name of the reference list.
        /// </summary>
        public string ReferenceListModule { get; set; }

        public GeneralDataType GeneralType { get; set; }

        /// <summary>
        /// Returns the Type of the enum referenced by the property
        /// </summary>
        public Type EnumType { get; set; }

        /// <summary>
        /// Returns the Type of the entity referenced by the property, either directly or through an Id
        /// provided by a property marked with an EntityReference attribute.
        /// </summary>
        public Type EntityReferenceType { get; set; }

        /// <summary>
        /// Name of the property to which any searches will be redirected. 
        /// E.g. this is useful if the property itself is calculated and therefore not persited to the DB
        /// and therefore cannot be queried.
        /// </summary>
        public string BackingSearchProperty { get; set; }

        public PropertyInfo PropertyInfo { get; set; }

        /// <summary>
        /// Label for the property.
        /// </summary>
        public string Label { get; set; }

        public bool LogChanges { get; set; }

        public virtual string FixedDescriptionOnChange { get; set; }
        public virtual bool DetailPropertyOnChange { get; set; }
        public virtual bool DetailOldValueOnChange { get; set; }
        public virtual bool DetailNewValueOnChange { get; set; }
        /// <summary>
        /// Provides a categorisation of the type of change logged.
        /// </summary>
        public virtual string AuditLogEntryNamespaceOnChange { get; set; }

        public string Category { get; set; }

        private bool? _isMapped;
        

        public Type EntityType { get; set; }

        /// <summary>
        /// If true, indicates that the property is mapped to the field of the DB table/view
        /// </summary>
        public bool IsMapped
        {
            get
            {
                if (_isMapped.HasValue)
                    return _isMapped.Value;

                if (GeneralType == GeneralDataType.JsonEntity)
                {
                    _isMapped = false;
                    return _isMapped.Value;
                }

                var informer = StaticContext.IocManager.Resolve<IDbMappingInformer>();
                _isMapped = informer.IsMappedEntity(EntityType, PropertyInfo);
                return _isMapped.Value;
            }
        }

        public PropertyConfiguration(Type entityType)
        {
            EntityType = entityType;
        }
    }
}