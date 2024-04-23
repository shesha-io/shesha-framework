using Shesha.Configuration.MappingMetadata;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.Extensions;
using Shesha.Reflection;
using Shesha.Services;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Reflection;

namespace Shesha.Configuration.Runtime
{
    /// <summary>
    /// Provides configuration information on Domain Model entities
    /// required at Run-time.
    /// </summary>
    public class EntityConfiguration
    {
        private const int _typeShortAliasMaxLength = 100;

        private static IDictionary<Type, EntityConfiguration> _entityConfigurations =
            new Dictionary<Type, EntityConfiguration>();

        private string _typeShortAlias;

        #region Constructors and Initialisation

        public EntityConfiguration(Type entityType)
        {
            entityType = entityType.StripCastleProxyType();
            EntityType = entityType;
            Properties = new Dictionary<string, PropertyConfiguration>();

            var configByReflectionLoader = new EntityConfigurationLoaderByReflection();
            configByReflectionLoader.LoadConfiguration(this);
        }

        #endregion

        #region Public Properties

        /// <summary>
        /// The name of the property that will be used to display the entity to the user.
        /// </summary>
        public PropertyInfo DisplayNamePropertyInfo { get; set; }

        public bool HasTypeShortAlias => !string.IsNullOrEmpty(_typeShortAlias);

        public string SafeTypeShortAlias => _typeShortAlias;

        /// <summary>
        /// Type short alias of the entity type (see <see cref="EntityAttribute"/>)
        /// </summary>
        /// <exception cref="ConfigurationErrorsException">Thrown when entity has no TypeShortAlias</exception>
        public string TypeShortAlias
        {
            get
            {
                if (string.IsNullOrEmpty(_typeShortAlias))
                    throw new ConfigurationErrorsException(
                        $"TypeShortAlias property for entity '{EntityType.FullName}' has not been specified.");

                if (!TypeShortAliasIsValid)
                    throw new ConfigurationErrorsException(
                        $"TypeShortAlias property for entity '{EntityType.FullName}' must be {_typeShortAliasMaxLength} characters or less.");

                return _typeShortAlias;
            }
            set => _typeShortAlias = value;
        }

        public bool TypeShortAliasIsValid
        {
            get 
            {
                return string.IsNullOrEmpty(_typeShortAlias) || _typeShortAlias.Length <= _typeShortAliasMaxLength;
            }
        }

        public string FriendlyName { get; set; }
        public string Accessor { get; set; }

        public string TableName => MappingMetadata?.TableName;
        public string DiscriminatorValue => MappingMetadata?.DiscriminatorValue;

        private EntityMappingMetadata _mappingMetadata;
        private static object _nhMetadataLock = new object();
        public EntityMappingMetadata MappingMetadata
        {
            get
            {
                if (_mappingMetadata != null)
                    return _mappingMetadata;

                lock (_nhMetadataLock)
                {
                    if (_mappingMetadata != null)
                        return _mappingMetadata;

                    return _mappingMetadata = StaticContext.IocManager.Resolve<IMappingMetadataProvider>().GetEntityMappingMetadata(EntityType);
                }
            }
        }

        private readonly object _typeShortAliasesHierarchyLock = new object();
        private List<string> _typeShortAliasesHierarchy;
        public List<string> TypeShortAliasesHierarchy
        {
            get
            {
                if (_typeShortAliasesHierarchy != null)
                    return _typeShortAliasesHierarchy;

                lock (_typeShortAliasesHierarchyLock)
                {
                    var result = new List<string>();
                    if (HasTypeShortAlias)
                        result.Add(TypeShortAlias);

                    var type = EntityType.BaseType;
                    while (type != null && !type.IsAbstract)
                    {
                        var config = type.GetEntityConfiguration();
                        if (config.HasTypeShortAlias)
                            result.Add(config.TypeShortAlias);
                        type = type.BaseType;
                    }
                    result = result.Where(i => !string.IsNullOrWhiteSpace(i)).Distinct().ToList();
                    _typeShortAliasesHierarchy = result;
                }

                return _typeShortAliasesHierarchy;
            }
        }

        public Type EntityType { get; set; }
        public Type IdType => EntityType?.GetEntityIdType();

        public IList<PropertySetChangeLoggingConfiguration> ChangeLogConfigurations = new List<PropertySetChangeLoggingConfiguration>();

        public Dictionary<string, PropertyConfiguration> Properties { get; set; }

        public PropertyConfiguration this[string propertyName]
        {
            get
            {
                if (propertyName.IndexOf('.') > -1)
                {
                    // Requesting a child property
                    var propInfo = ReflectionHelper.GetProperty(EntityType, propertyName);
                    return propInfo.DeclaringType.GetEntityConfiguration()[propInfo.Name];
                }
                else
                {
                    return Properties[propertyName];
                }
            }
        }

        #endregion

        /// <summary>
        /// Type of the default application service
        /// </summary>
        public Type ApplicationServiceType { get; set; }

        public class PropertySetChangeLoggingConfiguration
        {
            public PropertySetChangeLoggingConfiguration()
            {
                AuditedProperties = new List<string>();
            }

            public virtual string Namespace { get; internal set; }
            public virtual IList<string> AuditedProperties { get; internal set; }
        }
    }
}
