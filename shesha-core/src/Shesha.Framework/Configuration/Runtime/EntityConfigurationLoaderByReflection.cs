using JetBrains.Annotations;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.EntityReferences;
using Shesha.Extensions;
using Shesha.JsonEntities;
using Shesha.Reflection;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Reflection;

namespace Shesha.Configuration.Runtime
{
    /// <summary>
    /// Loads entity configuration information using reflection.
    /// </summary>
    public class EntityConfigurationLoaderByReflection
    {
        public void LoadConfiguration([NotNull]EntityConfiguration config)
        {
            LoadEntityConfiguration(config);

            // Loading property configuration.
            var ownProps = config.EntityType.GetProperties(BindingFlags.DeclaredOnly | BindingFlags.GetProperty | BindingFlags.Public | BindingFlags.Instance).ToList();
            var props = config.EntityType.GetProperties().ToList();

            var propsWithoutDuplicates = props.GroupBy(p => p.Name, (name, duplicates) =>
                duplicates
                    .Select(dp => new { IsOwn = ownProps.Contains(dp), Prop = dp })
                    .OrderByDescending(dp => dp.IsOwn ? 1 : 0)
                    .Select(dp => dp.Prop)
                    .First()
                ).ToList();
            if (propsWithoutDuplicates.Count < props.Count)
            {
                var duplicates = props.Where(p => !propsWithoutDuplicates.Contains(p)).ToList();
                props = propsWithoutDuplicates;
            }

            foreach (var prop in props)
            {
                try
                {
                    var propConfig = LoadPropertyConfiguration(prop, config.EntityType);
                    config.Properties.Add(prop.Name, propConfig);
                }
                catch
                {
                    throw;
                }
            }
        }

        private void LoadEntityConfiguration(EntityConfiguration config)
        {
            var entityAtt = config.EntityType.GetUniqueAttribute<EntityAttribute>();

            config.FriendlyName = entityAtt != null && !string.IsNullOrEmpty(entityAtt.FriendlyName)
                ? entityAtt.FriendlyName
                : config.EntityType.Name; // Fall back to type name when friendly name is not specified

            config.Accessor = config.EntityType.GetTypeAccessor();
            config.SetTypeShortAlias(config.EntityType.GetTypeShortAliasOrNull());

            LoadChangeLoggingConfiguration(config);
            config.DisplayNamePropertyInfo = config.EntityType.GetDisplayNamePropertyInfoOrNull();
        }

        private static PropertyConfiguration LoadPropertyConfiguration(PropertyInfo prop, Type entityType)
        {
            var propConfig = new PropertyConfiguration(entityType) {
                PropertyInfo = prop,
                GeneralType = GetGeneralDataType(prop),
                Category = prop.GetAttributeOrNull<CategoryAttribute>()?.Category,
                Label = prop.GetDisplayName(),
            };

            switch (propConfig.GeneralType)
            {
                case GeneralDataType.Numeric:
                case GeneralDataType.ReferenceList:
                    {
                        var refListAtt = prop.GetAttributeOrNull<ReferenceListAttribute>(true);
                        var refListId = refListAtt?.GetReferenceListIdentifier(prop);
                        if (refListId == null)
                        {
                            var underlyingType = prop.PropertyType.GetUnderlyingTypeIfNullable();

                            if (underlyingType.IsEnum && underlyingType.HasAttribute<ReferenceListAttribute>())
                            {
                                refListAtt = underlyingType.GetAttributeOrNull<ReferenceListAttribute>();
                                refListId = refListAtt?.GetReferenceListIdentifier(underlyingType);
                            }
                        }

                        if (refListId != null)
                        {
                            propConfig.ReferenceListName = refListId.Name;
                            propConfig.ReferenceListModule = refListId.Module;

                            if (refListAtt != null)
                                propConfig.ReferenceListOrderByName = refListAtt.OrderByName;
                        }

                        break;
                    }
                case GeneralDataType.Enum:
                    var enumType = prop.PropertyType.GetUnderlyingTypeIfNullable();
                    propConfig.EnumType = enumType;
                    break;
                case GeneralDataType.MultiValueReferenceList: 
                    {
                        var mvRefListAtt = prop.GetAttribute<MultiValueReferenceListAttribute>(true);
                        var refListId = mvRefListAtt.GetReferenceListIdentifier(prop);
                        propConfig.ReferenceListName = refListId.Name;
                        propConfig.ReferenceListModule = refListId.Module;
                        break;
                    }
                case GeneralDataType.EntityReference:
                    propConfig.EntityReferenceType = prop.PropertyType;
                    break;
                default:
                    break;
            }

            LoadChangeLoggingPropertyConfiguration(prop, propConfig);
            
            return propConfig;
        }

        private void LoadChangeLoggingConfiguration(EntityConfiguration config)
        {
            return;
            /* todo: check ABP audit logging and uncomment/remove
            var propertiesNeedToLogChangesFor = config.EntityType.GetProperties(BindingFlags.Instance | BindingFlags.Public).Where(prop => prop.GetCustomAttributes(typeof(LogChangesAttribute), true).Length > 0).ToList(); // BindingFlags.DeclaredOnly - removed to log changes for inherited properties

            if (!propertiesNeedToLogChangesFor.Any())
            {
                config.HasPropertiesNeedToLogChangesFor = false;
            }
            else
            {
                config.HasPropertiesNeedToLogChangesFor = true;
                if (string.IsNullOrEmpty(config.TypeShortAlias))
                    throw new ConfigurationException(string.Format("Properties have been marked for Audit on entity '{0}' but a TypeShortAlias which is required for auditing has not been assigned for the entity. Tip: Apply the Entity attribute to the entity class to assign the TypeShortAlias.", config.EntityType.FullName));

                foreach (var prop in propertiesNeedToLogChangesFor)
                {
                    foreach (var attribute in prop.GetCustomAttributes(typeof(LogChangesAttribute), true).Cast<LogChangesAttribute>())
                    {
                        // Ensuring that the LogChanges attribute is not applied to Collections/Lists.
                        if (ReflectionHelper.IsCollectionType(prop.PropertyType))
                        {
                            throw new ConfigurationException(string.Format("Property '{0}' on entity '{1}' cannot be marked with LogChange Attribute as logging of changes to a collection is not supported.", prop.Name, config.EntityType.FullName));
                        }

                        var changeLogConfig = config.ChangeLogConfigurations.FirstOrDefault(o => o.Namespace == attribute.Namespace);

                        if (changeLogConfig == null)
                        {
                            changeLogConfig = new EntityConfiguration.PropertySetChangeLoggingConfiguration();
                            changeLogConfig.Namespace = attribute.Namespace;
                            config.ChangeLogConfigurations.Add(changeLogConfig);
                        }

                        if (changeLogConfig.AuditedProperties.FirstOrDefault(propLoggingConfig => propLoggingConfig == prop.Name) != null)
                        {
                            throw new ConfigurationException(string.Format("Property '{0}' on entity '{1}' cannot have more than one LogChange Attribute.", prop.Name, config.EntityType.FullName));
                        }
                        else
                        {
                            changeLogConfig.AuditedProperties.Add(prop.Name);
                        }
                    }
                }
            }
            */
        }

        public static GeneralDataType GetGeneralDataType(PropertyInfo propInfo)
        {
            if (IsPropertyStoredFile(propInfo))
                return GeneralDataType.StoredFile;
            if (propInfo.PropertyType.IsEntityType())
                return GeneralDataType.EntityReference;

            if (propInfo.HasAttribute<MultiValueReferenceListAttribute>())
                return GeneralDataType.MultiValueReferenceList;

            if (propInfo.IsReferenceListProperty())
                return GeneralDataType.ReferenceList;

            if (propInfo.PropertyType.IsEnum)
                return GeneralDataType.Enum;
            var underlyingPropType = ReflectionHelper.GetUnderlyingTypeIfNullable(propInfo.PropertyType);

            if (underlyingPropType == typeof(string))
            {
                return GeneralDataType.Text;
            }
            else if (underlyingPropType == typeof(DateTime))
            {
                var dataTypeAtt = propInfo.GetAttributeOrNull<DataTypeAttribute>();

                if (dataTypeAtt != null &&
                    dataTypeAtt.GetDataTypeName().Equals("Date", StringComparison.InvariantCultureIgnoreCase))
                {
                    return GeneralDataType.Date;
                }
                else
                {
                    return GeneralDataType.DateTime;
                }
            }
            else if (underlyingPropType == typeof(TimeSpan))
            {
                return GeneralDataType.Time;
            }
            else if (underlyingPropType == typeof(bool))
            {
                return GeneralDataType.Boolean;
            }
            else if (underlyingPropType == typeof(Guid))
            {
                return GeneralDataType.Guid;
            }
            else if (underlyingPropType == typeof(int)
                     || underlyingPropType == typeof(long)
                     || underlyingPropType == typeof(short)
                     || underlyingPropType == typeof(Single)
                     || underlyingPropType == typeof(Double)
                     || underlyingPropType == typeof(decimal)
                )
            {
                return GeneralDataType.Numeric;
            }
            else if (underlyingPropType.IsSubtypeOfGeneric(typeof(IList<>)) 
					|| underlyingPropType.IsSubtypeOfGeneric(typeof(ICollection<>)))
            {
                return GeneralDataType.List;
            } 
			else if (underlyingPropType.IsAssignableTo(typeof(IGenericEntityReference)))
                return GeneralDataType.GenericEntityReference;
            else if (underlyingPropType == typeof(string))
                return GeneralDataType.Text;
            else if (underlyingPropType.IsAssignableTo(typeof(IJsonEntity)))
                return GeneralDataType.JsonEntity;
            else
                return GeneralDataType.Unknown;
        }

        private static bool IsPropertyStoredFile(PropertyInfo propInfo)
        {
            return typeof(StoredFile).IsAssignableFrom(propInfo.PropertyType);
        }

        private static void LoadChangeLoggingPropertyConfiguration(PropertyInfo propInfo, PropertyConfiguration propConfig)
        {
            propConfig.LogChanges = false;
            /* todo: review ABP logging and uncomment/remove
            var att = ReflectionHelper.GetPropertyAttribute<LogChangesAttribute>(propInfo);
            if (att == null)
            {
                propConfig.LogChanges = false;
            }
            else
            {
                propConfig.LogChanges = true;
                propConfig.FixedDescriptionOnChange = att.FixedDescription;
                propConfig.DetailPropertyOnChange = att.DetailPropertyInDescription;
                propConfig.DetailOldValueOnChange = att.DetailOldValueInDescription;
                propConfig.DetailNewValueOnChange = att.DetailNewValueInDescription;
                propConfig.AuditLogEntryNamespaceOnChange = att.Namespace;
            }
            */
        }
    }
}
