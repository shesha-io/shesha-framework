using Abp.Auditing;
using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using NetTopologySuite.Geometries;
using Shesha.Configuration.Runtime;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.DynamicEntities;
using Shesha.Extensions;
using Shesha.Metadata.Dtos;
using Shesha.Reflection;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Reflection;

namespace Shesha.Metadata
{
    /// <summary>
    /// Metadata provider
    /// </summary>
    public class MetadataProvider: IMetadataProvider, ITransientDependency
    {
        private readonly IEntityConfigurationStore _entityConfigurationStore;

        public MetadataProvider(IEntityConfigurationStore entityConfigurationStore)
        {
            _entityConfigurationStore = entityConfigurationStore;
        }

        /// inheritedDoc
        public List<PropertyMetadataDto> GetProperties(Type containerType, MetadataContext context = null)
        {
            context ??= new MetadataContext(containerType);

            var flags = BindingFlags.Public | BindingFlags.Instance;

            var allProps = containerType.GetProperties(flags).OrderBy(p => p.Name).ToList();
            if (containerType.IsEntityType())
                allProps = allProps.Where(p => MappingHelper.IsPersistentProperty(p) || p.CanRead && p.HasAttribute<NotMappedAttribute>()).ToList();

            if (containerType.IsEntityType()) {
                var allPropsOld = allProps.Where(p => MappingHelper.IsPersistentProperty(p)).ToList();
            }                

            var allPropsMetadata = allProps.Select(p => GetPropertyMetadata(p, context)).ToList();

            var result = allPropsMetadata
                .OrderBy(e => e.Path)
                .ToList();

            return result;
        }

        private double? GetMin(PropertyInfo property) 
        {
            var value = property.GetAttribute<RangeAttribute>()?.Minimum;
            return value != null
                ? Convert.ToDouble(value)
                : null;
        }

        private double? GetMax(PropertyInfo property)
        {
            var value = property.GetAttribute<RangeAttribute>()?.Maximum;
            return value != null
                ? Convert.ToDouble(value)
                : null;
        }

        /// inheritedDoc
        public PropertyMetadataDto GetPropertyMetadata(PropertyInfo property, MetadataContext context)
        {
            var entityPropAttr = property.GetCustomAttribute<EntityPropertyAttribute>();
            var path = string.IsNullOrEmpty(entityPropAttr?.Name) ? property.Name : entityPropAttr.Name;

            var ownerType = property.DeclaringType != null && property.DeclaringType.IsEntityType()
                ? property.DeclaringType
                : property.ReflectedType.IsEntityType()
                    ? property.ReflectedType
                    : null;
            var entityConfig = ownerType != null
                ? _entityConfigurationStore.Get(ownerType)
                : null;
            var epc = entityConfig?[property.Name];

            var dataType = GetDataType(property);
            var cascadeAttribute = property.GetAttribute<CascadeUpdateRulesAttribute>()
                ?? property.PropertyType.GetCustomAttribute<CascadeUpdateRulesAttribute>();
            var result = new PropertyMetadataDto
            {
                Path = path,
                Label = ReflectionHelper.GetDisplayName(property),
                Description = ReflectionHelper.GetDescription(property),
                IsVisible = property.GetAttribute<BrowsableAttribute>()?.Browsable ?? true,
                Required = property.HasAttribute<RequiredAttribute>(),
                Readonly = !property.CanWrite 
                    || property.HasAttribute<ReadonlyPropertyAttribute>()
                    || (property.GetAttribute<ReadOnlyAttribute>()?.IsReadOnly ?? false),
                Min = GetMin(property),
                Max = GetMax(property),
                MinLength = property.GetAttribute<StringLengthAttribute>()?.MinimumLength,
                MaxLength = property.GetAttribute<StringLengthAttribute>()?.MaximumLength,
                Audited = property.HasAttribute<AuditedAttribute>(),
                RegExp = property.GetAttribute<RegularExpressionAttribute>()?.Pattern,
                ValidationMessage = property.GetAttribute<RangeAttribute>()?.ErrorMessage 
                    ?? property.GetAttribute<StringLengthAttribute>()?.ErrorMessage
                    ?? property.GetAttribute<RegularExpressionAttribute>()?.ErrorMessage,
                CascadeCreate = cascadeAttribute?.CanCreate,
                CascadeUpdate = cascadeAttribute?.CanUpdate,
                CascadeDeleteUnreferenced = cascadeAttribute?.DeleteUnreferenced,

                DataType = dataType.DataType,
                DataFormat = dataType.DataFormat,
                EntityTypeShortAlias = property.PropertyType.IsEntityType()
                    ? _entityConfigurationStore.Get(property.PropertyType)?.SafeTypeShortAlias ?? property.PropertyType.FullName
                    : property.PropertyType.IsJsonEntityType()
                        ? property.PropertyType.FullName
                        : dataType.DataType == DataTypes.Array
                            ?   dataType.ObjectType
                            : null
                        ,
                ReferenceListModule = epc?.ReferenceListModule,
                ReferenceListName = epc?.ReferenceListName,
                EnumType = epc?.EnumType,
                OrderIndex = property.GetAttribute<DisplayAttribute>()?.GetOrder() ?? -1,
                IsFrameworkRelated = IsFrameworkRelatedProperty(property),
                //ConfigurableByUser = property.GetAttribute<BindableAttribute>()?.Bindable ?? true,
                //GroupName = ReflectionHelper.get(declaredProperty ?? property),
                IsFilterable = epc != null && epc.IsMapped,
                IsSortable = epc != null && epc.IsMapped,
            };
            if (!context.ProcessedTypes.Contains(property.PropertyType) && property.PropertyType.IsNotAnyEntityAndSystemType())
            {
                result.Properties = GetProperties(property.PropertyType, context);
            }
            if (dataType.DataType == DataTypes.Array)
            {
                result.ItemsType = GetItemsType(property, context);
            }

            context.ProcessedTypes.Add(property.PropertyType);

            return result;
        }

        private PropertyMetadataDto GetItemsType(PropertyInfo property, MetadataContext context)
        {
            if (property.IsMultiValueReferenceListProperty()) 
            {
                return new PropertyMetadataDto
                {
                    Path = "value",
                    DataType = DataTypes.Number,
                    DataFormat = NumberFormats.Int64,
                };
            }

            if (property.PropertyType.IsNotAnyEntityAndSystemType())
            {
                return new PropertyMetadataDto
                {
                    Path = property.Name,
                    DataType = DataTypes.Object,
                    Properties = GetProperties(property.PropertyType, context)
                };
            }

            return null;
        }

        /// inheritedDoc
        public bool IsFrameworkRelatedProperty(PropertyInfo property)
        {
            return IsInterfaceProperty(property, typeof(IEntity<>), nameof(IEntity.Id)) ||
                IsInterfaceProperty(property, typeof(IHasCreationTime), nameof(IHasCreationTime.CreationTime)) ||
                IsInterfaceProperty(property, typeof(ICreationAudited), nameof(ICreationAudited.CreatorUserId)) ||
                IsInterfaceProperty(property, typeof(ICreationAudited<>), nameof(ICreationAudited<IEntity<long>>.CreatorUser)) ||

                IsInterfaceProperty(property, typeof(IHasModificationTime), nameof(IHasModificationTime.LastModificationTime)) ||
                IsInterfaceProperty(property, typeof(IModificationAudited), nameof(IModificationAudited.LastModifierUserId)) ||
                IsInterfaceProperty(property, typeof(IModificationAudited<>), nameof(IModificationAudited<IEntity<long>>.LastModifierUser)) ||

                IsInterfaceProperty(property, typeof(IHasDeletionTime), nameof(IHasDeletionTime.DeletionTime)) ||
                IsInterfaceProperty(property, typeof(IDeletionAudited), nameof(IDeletionAudited.DeleterUserId)) ||
                IsInterfaceProperty(property, typeof(IDeletionAudited<>), nameof(IDeletionAudited<IEntity<long>>.DeleterUser)) ||

                IsInterfaceProperty(property, typeof(ISoftDelete), nameof(ISoftDelete.IsDeleted)) ||
                IsInterfaceProperty(property, typeof(IMayHaveTenant), nameof(IMayHaveTenant.TenantId)) ||
                IsInterfaceProperty(property, typeof(IMustHaveTenant), nameof(IMustHaveTenant.TenantId)) ||
                IsInterfaceProperty(property, typeof(IHasClassNameField), nameof(IHasClassNameField._className)) ||
                IsInterfaceProperty(property, typeof(IHasDisplayNameField), nameof(IHasDisplayNameField._displayName))
                ;
        }

        private bool IsInterfaceProperty(PropertyInfo property, Type @interface, string name) 
        {
            if (property.Name != name)
                return false;

            return @interface.IsGenericType
                ? property.DeclaringType.GetInterfaces().Any(x =>
                        x.IsGenericType &&
                        x.GetGenericTypeDefinition() == @interface)
                : property.DeclaringType.GetInterfaces().Contains(@interface);
        }

        private string GetStringFormat(PropertyInfo propInfo) 
        {
            var dataTypeAtt = propInfo.GetAttribute<DataTypeAttribute>();

            switch (dataTypeAtt?.DataType)
            {
                case DataType.Password:
                    return StringFormats.Password;
                case DataType.Text:
                    return StringFormats.Singleline;
                case DataType.MultilineText:
                    return StringFormats.Multiline;
                case DataType.Html:
                    return StringFormats.Html;
                case DataType.EmailAddress:
                    return StringFormats.EmailAddress;
                case DataType.PhoneNumber:
                    return StringFormats.PhoneNumber;
                case DataType.Url:
                    return StringFormats.Url;
                default: 
                    return StringFormats.Singleline;
            }
        }

        /// inheritedDoc
        public DataTypeInfo GetDataType(PropertyInfo propInfo)
        {
            var propType = ReflectionHelper.GetUnderlyingTypeIfNullable(propInfo.PropertyType);

            if (propType == typeof(Guid)) 
                return new DataTypeInfo(DataTypes.Guid);

            var dataTypeAtt = propInfo.GetAttribute<DataTypeAttribute>();

            // for enums - use underlaying type
            if (propType.IsEnum)
                propType = propType.GetEnumUnderlyingType();

            if (propType == typeof(string)) 
            {
                return new DataTypeInfo(DataTypes.String, GetStringFormat(propInfo));
            }

            if (propType == typeof(DateTime))
            {
                return dataTypeAtt != null && dataTypeAtt.GetDataTypeName().Equals("Date", StringComparison.InvariantCultureIgnoreCase)
                    ? new DataTypeInfo(DataTypes.Date)
                    : new DataTypeInfo(DataTypes.DateTime);
            }

            if (propType == typeof(TimeSpan))
                return new DataTypeInfo(DataTypes.Time);

            if (propType == typeof(bool))
                return new DataTypeInfo(DataTypes.Boolean);

            if (propInfo.IsMultiValueReferenceListProperty())
                return new DataTypeInfo(DataTypes.Array, ArrayFormats.ReferenceListItem);

            if (propInfo.IsReferenceListProperty())
                return new DataTypeInfo(DataTypes.ReferenceListItem);

            if (propType.IsEntityType() || propType.IsEntityReferenceType())
                return new DataTypeInfo(DataTypes.EntityReference);

            // note: numeric datatypes mapping is based on the OpenApi 3
            if (propType  == typeof(int) || propType == typeof(byte) || propType == typeof(short))
                return new DataTypeInfo(DataTypes.Number, NumberFormats.Int32);

            if (propType == typeof(Int64))
                return new DataTypeInfo(DataTypes.Number, NumberFormats.Int64);

            if (propType == typeof(Geometry))
                return new DataTypeInfo(DataTypes.Geometry);

            if (propType == typeof(Single) || propType == typeof(float))
                return new DataTypeInfo(DataTypes.Number, NumberFormats.Float);

            if (propType == typeof(double) || propType == typeof(decimal))
                return new DataTypeInfo(DataTypes.Number, NumberFormats.Double);

            if (propType.IsSubtypeOfGeneric(typeof(IList<>)) || propType.IsSubtypeOfGeneric(typeof(ICollection<>)) ||
                propType.IsSubtypeOfGeneric(typeof(List<>)) || propType.IsSubtypeOfGeneric(typeof(Collection<>)) ||
                propType.IsSubtypeOfGeneric(typeof(IEnumerable<>))
                )
            {
                var paramType = propType.GetGenericArguments()[0];
                var format = paramType.IsClass
                    ? paramType.IsEntityType()
                        ? ArrayFormats.EntityReference
                        : paramType.IsJsonEntityType()
                            ? ArrayFormats.ObjectReference
                            : ArrayFormats.Object
                    : null;
                return new DataTypeInfo(DataTypes.Array, format, format != null ? paramType.FullName : null);
            }

            if (propType.IsClass)
            {
                if (propType.IsJsonEntityType())
                    return new DataTypeInfo(DataTypes.ObjectReference);
                else
                    return new DataTypeInfo(DataTypes.Object);
            }

            throw new NotSupportedException($"Data type not supported: {propType.FullName}");
        }

        /*
        /// <summary>
        /// Returns .Net type that is used to store data for the specified <paramref name="dataType"/> and <paramref name="dataFormat"/>
        /// </summary>
        /// <param name="dataType"></param>
        /// <param name="dataFormat"></param>
        /// <returns></returns>
        public static Type GetType(string dataType, string dataFormat)
        {
            switch (dataType) 
            {
                case DataTypes.Guid:
                    return typeof(Guid);
                case DataTypes.String:
                    return typeof(string);
                case DataTypes.Date:
                case DataTypes.DateTime:
                    return typeof(DateTime);
                case DataTypes.Time:
                    return typeof(TimeSpan);
                case DataTypes.Boolean:
                    return typeof(bool);
                case DataTypes.ReferenceListItem:
                    return typeof(Int64);

                case DataTypes.Number:
                {
                    switch (dataFormat) 
                    {
                        case NumberFormats.Int32:
                            return typeof(int);
                        case NumberFormats.Int64:
                            return typeof(Int64);
                        case NumberFormats.Float:
                            return typeof(float);
                        case NumberFormats.Double:
                            return typeof(decimal);
                        default: 
                            return typeof(decimal);
                    }
                }

                case DataTypes.EntityReference:
                case DataTypes.Array:
                default:
                    throw new NotSupportedException($"Data type not supported: {dataType}");
            }
        }
        */
    }
}