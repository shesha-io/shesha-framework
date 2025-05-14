using Abp.Auditing;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Repositories;
using FluentMigrator.Infrastructure.Extensions;
using Shesha.Configuration.Runtime;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.EntityHistory;
using Shesha.Reflection;
using Shesha.Services;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Configuration;
using System.Globalization;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;

namespace Shesha.Extensions
{
    /// <summary>
    /// Entity extensions
    /// </summary>
    public static class EntityExtensions
    {
        public static bool IsAuditedProperty(this PropertyInfo property) 
        {
            return property.HasAttribute<AuditedAttribute>()
                || property.HasAttribute<AuditedAsEventAttribute>()
                || property.HasAttribute<AuditedAsManyToManyAttribute>()
                || property.GetCustomAttributes().Any(x =>
                    x.GetType().FindBaseGenericType(typeof(AuditedAsManyToManyAttribute<,,>)) != null
                    || x.GetType().FindBaseGenericType(typeof(AuditedAsManyToManyAttribute<,,,>)) != null
                );
        }

        /// <summary>
        /// Check if the property name is a one of special/system property
        /// </summary>
        /// <param name="propertyName"></param>
        /// <returns></returns>
        public static bool IsSpecialProperty(this string propertyName)
        {
            return
                propertyName == nameof(FullAuditedEntity.CreatorUserId)
                || propertyName == nameof(AuditedEntity<Guid, IEntity<long>>.CreatorUser)
                || propertyName == nameof(FullAuditedEntity.CreationTime)
                || propertyName == nameof(ISoftDelete.IsDeleted)
                || propertyName == nameof(FullAuditedEntity.DeleterUserId)
                || propertyName == nameof(FullAuditedEntity<Guid, IEntity<long>>.DeleterUser)
                || propertyName == nameof(FullAuditedEntity.DeletionTime)
                || propertyName == nameof(FullAuditedEntity.LastModifierUserId)
                || propertyName == nameof(AuditedEntity<Guid, IEntity<long>>.LastModifierUser)
                || propertyName == nameof(FullAuditedEntity.LastModificationTime)
                || propertyName == nameof(FullAuditedEntity.Id)
                || propertyName == nameof(IMayHaveTenant.TenantId);
        }

        /// <summary>
        /// Returns the DisplayName of the entity.
        /// </summary>
        /// <returns>Returns the DisplayName of the entity.</returns>
        public static string? GetDisplayName<T>(this IEntity<T> entity)
        {
            if (entity == null)
                return "";

            var displayNamePropInfo = entity.GetType().GetEntityConfiguration()?.DisplayNamePropertyInfo;

            return displayNamePropInfo == null
                ? string.Empty
                : entity.GetPropertyDisplayText(displayNamePropInfo.Name);
        }

        /// <summary>
        /// Returns the DisplayName of the entity.
        /// </summary>
        /// <returns>Returns the DisplayName of the entity.</returns>
        public static string? GetEntityDisplayName(this object entity)
        {
            if (entity == null)
                return string.Empty;

            var displayNamePropInfo = entity.GetType().GetEntityConfiguration()?.DisplayNamePropertyInfo;

            return displayNamePropInfo == null
                ? entity.GetType().GetDisplayNamePropertyInfoOrNull()?.GetValue(entity)?.ToString() ?? string.Empty
                : entity.GetPropertyDisplayText(displayNamePropInfo.Name);
        }

        private static readonly string[] displayNames = { "displayname", "name", "fullname", "address", "fulladdress" };

        /// <summary>
        /// Get the most appropriate Display Name property (started from DisplayName attribute)
        /// </summary>
        /// <param name="obj">The Object/Entity</param>
        /// <returns></returns>
        public static PropertyInfo? GetDisplayNamePropertyInfoOrNull(this object obj)
        {
            return GetDisplayNamePropertyInfoOrNull(obj.GetType());
        }
        /// <summary>
        /// Get the most appropriate Display Name property (started from DisplayName attribute)
        /// </summary>
        /// <param name="type">The type of Object/Entity</param>
        /// <returns></returns>
        public static PropertyInfo? GetDisplayNamePropertyInfoOrNull(this Type type)
        {
            var prop = ReflectionHelper.FindPropertyWithUniqueAttribute(type, typeof(EntityDisplayNameAttribute));
            if (prop == null)
            {
                foreach (var name in displayNames)
                {
                    prop = type.GetProperties().FirstOrDefault(z => z.Name.ToLower() == name);
                    if (prop != null)
                        return prop;
                }
            };
            return prop;
        }

        public static string? GetTypeShortAliasOrNull(this Type entityType)
        {
            var att = entityType.GetUniqueAttribute<EntityAttribute>();
            return att == null || string.IsNullOrEmpty(att.TypeShortAlias)
                ? null
                : att.TypeShortAlias;
        }

        public static string GetTypeShortAlias(this Type entityType) 
        {
            return entityType.GetTypeShortAliasOrNull() ?? throw new Exception($"Entity type '{entityType.FullName}' has no {nameof(EntityAttribute.TypeShortAlias)}");
        }

        public static string? GetReferenceListDisplayText<T, TValue>(this T owner, Expression<Func<T, TValue?>> expression) where TValue : struct, IConvertible
        {
            if (owner == null)
                return null;

            if (!(expression.Body is MemberExpression))
                throw new Exception("Expression should be MemberExpression");

            var memberExpression = (MemberExpression)expression.Body;

            if (memberExpression.Member is PropertyInfo prop)
            {
                var value = expression.Compile().Invoke(owner);
                if (value == null)
                    return null;
                var refListAttribute = prop.GetAttributeOrNull<ReferenceListAttribute>() ?? prop.PropertyType.GetUnderlyingTypeIfNullable().GetAttributeOrNull<ReferenceListAttribute>();
                if (refListAttribute != null)
                {
                    return StaticContext.IocManager.Resolve<IReferenceListHelper>().GetItemDisplayText(refListAttribute.GetReferenceListIdentifier(prop), value.Value.ToInt32(CultureInfo.InvariantCulture));
                }
            }
            return null;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <typeparam name="TId"></typeparam>
        /// <param name="entity"></param>
        /// <returns></returns>
        public static TId GetId<TId>(this IEntity<TId> entity)
        {
            return entity.Id;
        }

        public static object? GetId(this object entity)
        {
            if (entity == null)
                return null;

            return entity is IEntity<Guid> guidEntity
                ? guidEntity.GetId()
                : entity is IEntity<Int64> int64Entity
                    ? int64Entity.GetId()
                    : entity is IEntity<Int32> int32Entity
                        ? int32Entity.GetId()
                        : entity is IEntity<Int16> int16Entity
                            ? int16Entity.GetId()
                            : entity is IEntity<string> stringEntity
                                ? stringEntity.GetId()
                                : entity.GetType().GetProperty("Id")?.GetValue(entity);
        }

        public static string? GetPropertyDisplayText(this object entity, string propertyName, string defaultValue = "")
        {
            try
            {
                var propValue = ReflectionHelper.GetPropertyValueAccessor(entity, propertyName);
                if (!propValue.IsValueAvailable || propValue.Value == null)
                    return defaultValue;

                entity = propValue.Parent;
                propertyName = propValue.PropInfo.Name;
                var value = propValue.Value;

                var propConfig = entity.GetType().GetEntityConfiguration()[propertyName];
                var generalDataType = propConfig.GeneralType;               
                

                switch (generalDataType)
                {
                    case GeneralDataType.Enum:
                        var itemValue = Convert.ToInt32(value);
                        return ReflectionHelper.GetEnumDescription(propConfig.EnumType.NotNull($"{nameof(propConfig.EnumType)} must not be null"), itemValue);
                    case GeneralDataType.ReferenceList:
                        {
                            var refListHelper = StaticContext.IocManager.Resolve<IReferenceListHelper>();
                            return refListHelper.GetItemDisplayText(propConfig.GetRefListIdentifier(), (int)value);
                        }
                    case GeneralDataType.EntityReference:
                        {
                            var displayProperty = value.GetType().GetEntityConfiguration().DisplayNamePropertyInfo;
                            return displayProperty != null
                                ? displayProperty.GetValue(value)?.ToString()
                                : value.ToString();
                        }
                    default:
                        return GetPrimitiveTypePropertyDisplayText(value, propValue.PropInfo, defaultValue);
                }
            }
            catch (Exception ex)
            {
                throw new Exception(
                    $"An error occured whilst trying to retrieve DisplayText of property '{propertyName}' on type of '{entity.GetType().FullName}'.", ex);
            }
        }

        //[Obsolete("Should use native MVC functionality and related DataAnnotations e.g. Display")]
        public static string? GetPrimitiveTypePropertyDisplayText(object val, PropertyInfo propInfo, string defaultValue)
        {
            if (val == null || string.IsNullOrWhiteSpace(val.ToString()))
            {
                if (defaultValue == null)
                    return string.Empty;
                else
                    return defaultValue;
            }

            var format = EntityExtensions.GetPropertyDisplayFormat(propInfo);

            return FormatValue(val, propInfo, format, false);
        }

        private static string? GetPropertyDisplayFormat(PropertyInfo propInfo)
        {
            return propInfo.GetAttributeOrNull<DisplayFormatAttribute>(true)?.DataFormatString;
        }

        private static string? FormatValue(object val, PropertyInfo propInfo, string? format, bool isForEdit)
        {
            const string defaultFloatFormat = "N";
            const string defaultIntegerFormat = "D";
            const string defaultDateFormat = "dd/MM/yyyy";
            const string defaultDateTimeFormat = "dd/MM/yyyy HH:mm";

            var underlyingType = ReflectionHelper.GetUnderlyingTypeIfNullable(propInfo.PropertyType);

            if (underlyingType == typeof(string))
            {
                return string.IsNullOrEmpty(format)
                    ? val.ToString()
                    : string.Format(format, (string)val);
            }
            else if (underlyingType == typeof(DateTime))
            {
                var typedVal = (DateTime)val;
                string? finalFormat;

                var dataTypeAtt = propInfo.GetAttributeOrNull<DataTypeAttribute>();
                if (dataTypeAtt != null && dataTypeAtt.GetDataTypeName().Equals("Date", StringComparison.InvariantCultureIgnoreCase))
                {
                    finalFormat = StringHelper.FirstValue(format, defaultDateFormat);
                }
                else
                {
                    finalFormat = StringHelper.FirstValue(format, defaultDateTimeFormat);
                }
                return typedVal.ToString(finalFormat);
            }
            else if (underlyingType == typeof(int)
                || underlyingType == typeof(long)
                || underlyingType == typeof(short))
            {
                return Convert.ToInt64(val).ToString(StringHelper.FirstValue(format, defaultIntegerFormat));
            }
            else if (underlyingType == typeof(bool))
            {
                if (string.IsNullOrEmpty(format))
                    return val.ToString();

                var typedVal = (bool)val;
                var boolStrings = format.Split('|');
                if (boolStrings.Length != 2)
                    throw new Exception(
                        $"Exactly two tokens separated by '|' are expected as DisplayFormat for boolean property '{propInfo.Name}'.");
                return typedVal ? boolStrings[0] : boolStrings[1];
            }
            else if (underlyingType == typeof(decimal))
            {
                return ((decimal)val).ToString(StringHelper.FirstValue(format, defaultFloatFormat));
            }
            else if (underlyingType == typeof(Single)
                || underlyingType == typeof(Double))
            {
                return (Convert.ToDouble(val)).ToString(StringHelper.FirstValue(format, defaultFloatFormat));
            }
            else
            {
                return val.ToString();
            }
        }

        public static GeneralDataType GetGeneralDataType(this PropertyInfo propInfo)
        {
            return propInfo.DeclaringType.NotNull().GetEntityConfiguration()[propInfo.Name].GeneralType;
        }

        public static List<T> GetFullChain<T>(this T entity, Func<T, T?> parentFunc) where T : class
        {
            return entity.GetClosestChain(parentFunc, e => e == null);
        }

        public static List<T> GetClosestChain<T>(this T entity, Func<T, T?> parentFunc, Func<T, bool> condition) where T : class
        {
            var chain = new List<T>();
            var currentEntity = entity;
            while (currentEntity != null)
            {
                chain.Add(currentEntity);

                if (condition.Invoke(currentEntity))
                    break;

                var parent = parentFunc.Invoke(currentEntity);

                currentEntity = parent != null && !chain.Contains(parent) ? parent : null;
            }
            return chain;
        }

        public static T? Closest<T>(this T? entity, Func<T, T?> parentFunc, Func<T, bool> condition) where T : class
        {
            if (entity == null)
                return null;
            var item = entity.GetClosestChain(parentFunc, condition).LastOrDefault();

            return item != null && condition.Invoke(item) ? item : null;
        }

        public static GeneralDataType GetGeneralPropertyType(Type type, string propertyName)
        {
            return type.GetEntityConfiguration()[propertyName].GeneralType;
        }

        /// <summary>
        /// Returns TypeShortAlias of the specified entity
        /// </summary>
        /// <exception cref="ConfigurationErrorsException">Thrown when entity has no TypeShortAlias</exception>
        public static string GetTypeShortAlias<TId>(this IEntity<TId> entity)
        {
            return entity.GetType().GetEntityConfiguration().TypeShortAlias;
        }

        /// <summary>
        /// Loads the specified entity from the DB with cast to the specified class (if needed), is useful when the entity is loaded from the DB using the base class (e.g. Employee is loaded from the DB as a Person)
        /// </summary>
        public static TChild? LoadAs<TChild, TParent>(this TParent entity)
            where TParent : Entity<Guid>
            where TChild : TParent
        {
            if (entity == null)
                return null;

            if (entity is TChild casted)
                return casted;

            var service = StaticContext.IocManager.Resolve<IRepository<TChild, Guid>>();
            return service.Get(entity.Id);
        }

        /// <summary>
        /// Returns a string that represents a fully qualified entity Identifier.
        /// The identifier is in the following format: '[The entity's Type Assembly qualitfied name]|[entity Id]'
        /// </summary>
        /// <param name="entity">Entity for which a fully qualified identifier is required.</param>
        /// <returns>Returns a string that represents a fully qualified entity Identifier.</returns>
        public static string FullyQualifiedEntityId<TEntity, TId>(this TEntity entity) where TEntity : IEntity<TId>
        {
            var entityType = entity.GetType().StripCastleProxyType();
            return entityType.AssemblyQualifiedName + "|" + entity.GetId()?.ToString();
        }

        #region Multivalue reference list todo: review

        /// <summary>
        /// Decomposes an integers into an array of its constituent BitFlag values (i.e. 1, 2, 4, etc...).
        /// </summary>
        public static Int64[] DecomposeIntoBitFlagComponents(Int64 val)
        {
            return DecomposeIntoBitFlagComponents((long?)val);
        }

        /// <summary>
        /// Decomposes an integers into an array of its constituent BitFlag values (i.e. 1, 2, 4, etc...).
        /// </summary>
        public static Int64[] DecomposeIntoBitFlagComponents(long? val)
        {
            if (!val.HasValue || val == 0)
            {
                return new Int64[] { };
            }
            else
            {
                var resultAr = new List<Int64>();

                Int64 currentVal = 1;
                while (currentVal <= val)
                {
                    if ((val & currentVal) == currentVal)
                        resultAr.Add(currentVal);
                    currentVal = currentVal * 2;
                }

                return resultAr.ToArray();
            }
        }

        #endregion

        /// <summary>
        /// Get the true, underlying class of a proxied persistent class. This operation
		/// will initialize a proxy by side-effect.
        /// </summary>
        public static Type GetRealEntityType<TId>(this IEntity<TId> entity)
        {
            var provider = StaticContext.IocManager.Resolve<IEntityTypeProvider>();
            return provider.GetEntityType(entity);
        }        
    }
}