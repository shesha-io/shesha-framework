using Abp.Dependency;
using Abp.Domain.Entities;
using Shesha.Attributes;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.Extensions;
using Shesha.Modules;
using Shesha.Services;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Configuration;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;

namespace Shesha.Reflection
{
    public static class ReflectionHelper
    {
        /// <summary>
        /// Returns true if the <paramref name="instanceType"/> is a closed generic of the <paramref name="genericType"/> type
        /// </summary>
        /// <param name="genericType">Generic type</param>
        /// <param name="instanceType">Type you want to check</param>
        public static bool IsSubtypeOfGeneric(this Type instanceType, Type genericType)
        {
            var type = instanceType;
            while (type != null)
            {
                if (type.IsGenericType &&
                    type.GetGenericTypeDefinition() == genericType)
                {
                    return true;
                }
                type = type.BaseType;
            }
            return false;
        }

        /// <summary>
        /// Returns true if current <paramref name="type"/> implements interface <paramref name="interface"/>
        /// </summary>
        /// <param name="type"></param>
        /// <param name="interface"></param>
        /// <returns></returns>
        public static bool HasInterface(this Type type, Type @interface)
        {
            return @interface.IsAssignableFrom(type);
        }

        public static bool IsReadOnly(this PropertyInfo memberInfo, bool inherit = false)
        {
            return !memberInfo.CanWrite
                || memberInfo.HasAttribute<ReadOnlyAttribute>()
                || memberInfo.HasAttribute<ReadonlyPropertyAttribute>();
        }

        /// <summary>
        /// Returns true if the specified <paramref name="memberInfo"/> is marked with the specified attribute
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="memberInfo"></param>
        /// <param name="inherit"></param>
        /// <returns></returns>
        public static bool HasAttribute<T>(this MemberInfo memberInfo, bool inherit = false) where T : Attribute
        {
            return memberInfo.GetAttribute<T>() != null;
        }

        // todo: added unique check
        public static T GetUniqueAttribute<T>(this MemberInfo memberInfo) where T : Attribute
        {
            return GetAttribute<T>(memberInfo);
        }

        public static T GetAttribute<T>(this MemberInfo memberInfo, bool inherit = false) where T : Attribute
        {
            return memberInfo.GetCustomAttributes(typeof(T), inherit).Cast<T>().FirstOrDefault();
        }

        public static T GetAttribute<T>(this Type type, bool inherit = false) where T : Attribute
        {
            return type.GetCustomAttributes(typeof(T), inherit).Cast<T>().FirstOrDefault();
        }

        /// <summary>
        /// Returns the value of the property specified. 
        /// </summary>
        /// <param name="obj">Object whose property value is to be retreived.</param>
        /// <param name="propertyName">Name of the property or property hierarchy 
        /// e.g. 'Property1.SubProperty2.SubSubProperty3' </param>
        /// <param name="parent">Returns the parent object the last property in the hierarchy. 
        /// Returns null if did not manage to reach the end of the hierarchy because of null values
        /// along the way.</param>
        /// <param name="propInfo">Returns the <see cref="PropertyInfo"/> of
        /// the last property in the property hierachy.</param>
        /// <returns></returns>
        public static object GetPropertyValue(object obj, string propertyName, out object parent,
            out PropertyInfo propInfo)
        {
            //Entity propertyEntity;
            propInfo = GetProperty(obj, propertyName, out parent);
            if (parent != null)
                return propInfo.GetValue(parent, null);
            else
                return null;
        }

        public static object GetPropertyValue(object obj, string propertyName, object defaultValue)
        {
            if (obj == null)
                return null;
            var propInfo = obj.GetType().GetProperty(propertyName);

            return propInfo == null ? defaultValue : propInfo.GetValue(obj, null) ?? defaultValue;
        }

        public static object GetPropertyValue(IEntity obj, string propertyName)
        {
            return GetPropertyValue(obj, propertyName, out var parent, out var propInfo);
        }

        #region GetProperty

        /// <summary>
        /// Returns the PropertyInfo for the specified property on the specified Entity.
        /// </summary>
        /// <param name="entity">The entity whose property info is to be returned.</param>
        /// <param name="propertyName">The name of the property to return. This could also be
        /// a property hiererchy where want to reach the property of a child object e.g. 'Parent.ReferencedChildEntity.ChildEntityPropertyName'. </param>
        /// <param name="propertyEntity">The entity which the specified property belongs to.
        /// Where <paramref name="propertyName"/> refers to a property on <paramref name="entity"/> this will be the same
        /// as <paramref name="entity"/>, but where <paramref name="propertyName"/> refers to a property on a referenced
        /// child object e.g. 'Parent.ReferencedChildEntity.ChildEntityPropertyName', then will return the
        /// child entity the property belongs to i.e. 'ReferencedChildEntity' from the example.</param>
        /// <returns>Return the requested PropertyInfo.</returns>
        public static PropertyInfo GetProperty(object entity, string propertyName, out object propertyEntity)
        {
            return GetProperty(entity, null, propertyName, out propertyEntity);
        }

        public static PropertyInfo GetProperty(object entity, string propertyName)
        {
            return GetProperty(entity, null, propertyName, out var propertyEntity);
        }

        private static PropertyInfo GetProperty(object entity, Type type, string propertyName, out object propertyEntity)
        {
            var propTokens = propertyName.Split('.');
            var currentEntity = entity;
            Type currentType = (entity != null) ? entity.GetType() : type;

            for (int i = 0; i < propTokens.Length; i++)
            {
                PropertyInfo propInfo;
                var entityType = StripCastleProxyType(currentType);
                var properties = entityType.GetProperties();
                try
                {
                    propInfo = properties.FirstOrDefault(x => x.Name.ToCamelCase() ==  propTokens[i].ToCamelCase());
                }
                catch (AmbiguousMatchException)
                {
                    // Property may have been overriden using the 'new' keyword hence there are multiple properties with the same name.
                    // Will look for the one declared at the highest level.
                    propInfo = FindHighestLevelProperty(propTokens[i], entityType);
                }

                if (propInfo == null)
                {
                    propertyEntity = null;
                    return null;
                    //throw new ConfigurationException(string.Format("Property '{0}' does not exist on entity type '{1}'", propertyName, type.FullName));
                }

                if (i == propTokens.Length - 1)
                {
                    propertyEntity = currentEntity;
                    return propInfo;
                }
                else
                {
                    if (currentEntity != null)
                        currentEntity = propInfo.GetValue(currentEntity, null);

                    currentType = currentEntity == null 
                        ? propInfo.PropertyType 
                        : currentEntity.GetType();
                }
            }

            throw new Exception($"Property '{propertyName}' does not exist on entity type '{currentType.FullName}'");
        }

        public static PropertyInfo FindHighestLevelProperty(string propertyName, Type entityType)
        {
            //PropertyInfo propInfo;
            var propInfo = entityType.GetProperties()
                .FirstOrDefault(prop => prop.Name.Equals(propertyName, StringComparison.InvariantCultureIgnoreCase)
                                        && prop.DeclaringType == entityType);

            //var propInfo = entityType.GetProperty(propertyName);
            if (propInfo == null)
                return FindHighestLevelProperty(propertyName, entityType.BaseType);
            else
                return propInfo;
        }

        /// <summary>
        /// Gets the PropertyInfo for the specified property.
        /// WARNING!!!: This will return the PropertyInfo where the Declaring Type is the base class.
        /// This may therefore cause problems if you wish to retreive Attribute information (e.g. ReferenceList attribute)
        /// from sub-classes.
        /// </summary>
        public static PropertyInfo GetProperty<TEntity>(Expression<Func<TEntity, object>> property)
        {
            return GetProperty<TEntity, object>(property);
        }

        /// <summary>
        /// Gets the PropertyInfo for the specified property.
        /// WARNING!!!: This will return the PropertyInfo where the Declaring Type is the base class.
        /// This may therefore cause problems if you wish to retreive Attribute information (e.g. ReferenceList attribute)
        /// from sub-classes.
        /// </summary>
        public static PropertyInfo GetProperty<TEntity, TValue>(Expression<Func<TEntity, TValue>> property)
        {
            MemberExpression memberExpression = GetMemberExpression<TEntity, TValue>(property);
            var propInfo = memberExpression.Member as PropertyInfo;

            return propInfo;
        }

        public static MemberExpression GetMemberExpression<TEntity>(Expression<Func<TEntity, object>> expression)
        {
            return GetMemberExpression<TEntity, object>(expression);
        }

        public static MemberExpression GetMemberExpression<TEntity, TValue>(
            Expression<Func<TEntity, TValue>> expression)
        {
            MemberExpression memberExpression;
            if (expression.Body.NodeType == ExpressionType.MemberAccess)
                memberExpression = expression.Body as MemberExpression;
            else if (expression.Body.NodeType == ExpressionType.Convert)
                memberExpression = ((UnaryExpression)expression.Body).Operand as MemberExpression;
            else
                throw new ArgumentException(
                    $"Expressions of type '{Enum.GetName(typeof(ExpressionType), expression.NodeType)}' are not supported");
            return memberExpression;
        }

        #endregion

        /// <summary>
        /// Strips the proxy type generated by NHibernate (using Castle proxy) that typically 'wraps' 
        /// domain types. This is necessary as the proxy types sometimes interfere / cause unexpected results
        /// when performing reflection.
        /// </summary>
        /// <param name="type">Type</param>
        /// <returns>Returns <paramref name="type"/> if type is not a proxy class, else returns the BaseType of type.</returns>
        public static Type StripCastleProxyType(this Type type)
        {
            var strippers = IocManager.Instance.ResolveAll<IProxyStripper>();
            var currentType = type;
            foreach (var stripper in strippers) 
            {
                currentType = stripper.StripProxy(currentType);
            }
            return currentType;
        }

        #region FindPropertyWithUniqueAttribute

        /// <summary>
        /// Looks for a specified custom attribute on a classes' properties. Only a single
        /// property is allowed to be marked with the specified attribute or an exception is thrown.
        /// If the attribute is not found on the specified type, method will iterate
        /// through the type hierarchy to try to find the attribute on base types.
        /// </summary>
        /// <param name="type">Type whose properties to look through.</param>
        /// <param name="attributeType">The custom attribute to look for.</param>
        /// <returns>Returns the <see cref="PropertyInfo"/> of property marked with the 
        /// specified attribute. Returns Null if no property was marked with the specified attribute.
        /// If more than one property is marked with the attribute a <see cref="ConfigurationException"/> is thrown.</returns>
        public static PropertyInfo FindPropertyWithUniqueAttribute(Type type, Type attributeType)
        {
            return FindPropertyWithUniqueAttribute(type, attributeType, null);
        }

        public static object DynamicCast(object entity, Type to)
        {
            var openCast = typeof(ReflectionHelper).GetMethod("Cast", BindingFlags.Static | BindingFlags.Public);
            var closeCast = openCast.MakeGenericMethod(to);

            return closeCast.Invoke(entity, new[] { entity });
        }

        public static T Cast<T>(object entity) where T : class
        {
            return entity as T;
        }

        public static PropertyInfo FindPropertyWithUniqueAttribute(Type type, Type attributeType,
            Type expectedPropertyType)
        {
            type = StripCastleProxyType(type);

            var markedProperties =
                type.GetProperties(BindingFlags.Instance | BindingFlags.Public | BindingFlags.DeclaredOnly)
                    .Where(prop => prop.GetCustomAttributes(attributeType, false).Length > 0)
                    .ToList();

            if (markedProperties.Count == 0)
            {
                // Will try to look in subclasses if possible.
                if (type.BaseType == null || type.BaseType.Equals(typeof(IEntity)) || type.BaseType.Equals(typeof(object)))
                    return null;
                else
                    return FindPropertyWithUniqueAttribute(type.BaseType, attributeType, expectedPropertyType);
            }
            else if (markedProperties.Count == 1)
            {
                if (expectedPropertyType != null
                    && !(markedProperties[0].PropertyType == expectedPropertyType
                         || markedProperties[0].PropertyType.IsSubclassOf(expectedPropertyType)))
                //Could also try the following additional flexibility: !expectedPropertyType.IsAssignableFrom(markedProperties[0].PropertyType
                {
                    throw new ConfigurationErrorsException(
                        $"Property '{markedProperties[0].Name}' marked with attribute '{attributeType.FullName}' must be of type '{expectedPropertyType.Name}'.");
                }

                return markedProperties[0];
            }
            else
                throw new ConfigurationErrorsException($"Cannot mark more than one property with '{attributeType.FullName}'");
        }

        #endregion

        /// <summary>
        /// Checks if a given type is Nullable e.g. int?.
        /// </summary>
        /// <param name="type">Type to check.</param>
        /// <returns>Returns true if type is nullable, else returns false.</returns>
        public static bool IsNullableType(this Type type)
        {
            return (type.IsGenericType && type.GetGenericTypeDefinition() == typeof(Nullable<>));
        }

        /// <summary>
        /// Checks if a given property nullable
        /// </summary>
        public static bool IsNullable(this PropertyInfo property) 
        {
            return property.PropertyType.IsEntityType()
                ? !property.HasAttribute<System.Runtime.CompilerServices.RequiredMemberAttribute>()
                : property.PropertyType.IsNullableType() || property.HasAttribute<System.Runtime.CompilerServices.NullableAttribute>();
        }

        /// <summary>
        /// Checks to see if the specified type is Nullable and if so returns its underlying type, 
        /// otherwise returns the original type.
        /// </summary>
        public static Type GetUnderlyingTypeIfNullable(this Type type)
        {
            return IsNullableType(type)
                ? Nullable.GetUnderlyingType(type)
                : type;
        }

        /// <summary>
        /// Indicates is the specified type an enum or nullable enum
        /// </summary>
        /// <param name="type">Type to check</param>
        /// <returns></returns>
        public static bool IsEnumType(this Type type)
        {
            return GetNonNullableType(type).IsEnum;
        }

        /// <summary>
        /// Returns underlying type `T` if the type is Nullable{T}
        /// </summary>
        /// <param name="type"></param>
        /// <returns></returns>
        public static Type GetNonNullableType(Type type)
        {
            return IsNullableType(type) ? type.GetGenericArguments()[0] : type;
        }

        /// <summary>
        /// Checks if an object is an instance of a particular generic type.
        /// ACKNOWLEDGEMENT: code taken from http://stackoverflow.com/questions/982487/testing-if-object-is-of-generic-type-in-c
        /// </summary>
        /// <param name="genericType">The generic type e.g. 'typeof(List{})'</param>
        /// <param name="instance">Object to check.</param>
        /// <returns>Returns true if object is an instance of the generic type or subtype, else returns false.</returns>
        public static bool IsInstanceOfGenericType(Type genericType, object instance)
        {
            return instance.GetType().IsSubtypeOfGeneric(genericType);
        }

        public static string GetPropertyName<TEntity>(Expression<Func<TEntity, object>> expression)
        {
            return GetPropertyName<TEntity, object>(expression);
        }

        public static string GetPropertyName<TEntity, TValue>(Expression<Func<TEntity, TValue>> expression)
        {
            string propertyName = string.Empty;

            PrependExpressionComponent(expression.Body, ref propertyName);

            return propertyName;
        }

        private static void PrependExpressionComponent(Expression exp, ref string propertyName)
        {
            if (exp.NodeType == ExpressionType.MemberAccess)
            {
                if (string.IsNullOrEmpty(propertyName))
                    propertyName = ((MemberExpression)exp).Member.Name;
                else
                    propertyName = ((MemberExpression)exp).Member.Name + "." + propertyName;

                PrependExpressionComponent(((MemberExpression)exp).Expression, ref propertyName);
            }
            else if (exp.NodeType == ExpressionType.Convert)
            {
                PrependExpressionComponent(((UnaryExpression)exp).Operand, ref propertyName);
            }
            else if (exp.NodeType == ExpressionType.Parameter)
            {
                // Have reached the input parameter.
            }
            else
            {
                throw new ArgumentException(string.Format("Expressions of type '{0}' are not supported",
                    Enum.GetName(typeof(ExpressionType), exp.NodeType)));
            }
        }

        /// <summary>
        /// Return category name of the specified <paramref name="member"/>. 
        /// If the member is decorated with <see cref="CategoryAttribute"/> - returns <see cref="CategoryAttribute.Category"/>
        /// If the member is decorated with <see cref="DisplayAttribute"/> - returns <see cref="DisplayAttribute.GroupName"/>
        /// </summary>
        public static string GetCategory(this MemberInfo member)
        {
            var categoryAttribute = member.GetAttribute<CategoryAttribute>();
            if (categoryAttribute != null)
                return categoryAttribute.Category;

            var displayAttribute = member.GetAttribute<DisplayAttribute>();
            return displayAttribute?.GetGroupName();
        }

        /// <summary>
        /// Return display name of the specified member
        /// </summary>
        public static string GetDisplayName(this MemberInfo property)
        {
            var displayAttribute = property.GetAttribute<DisplayAttribute>();

            return displayAttribute?.GetName() ?? property.Name.ToFriendlyName();
        }

        /// <summary>
        /// Return description of the specified member
        /// </summary>
        public static string GetDescription(this MemberInfo property)
        {
            var descriptionAttribute = property.GetAttribute<DescriptionAttribute>();
            var displayAttribute = property.GetAttribute<DisplayAttribute>();

            var description = descriptionAttribute?.Description;
            if (string.IsNullOrWhiteSpace(description))
                description = displayAttribute?.GetDescription();

            return description;
        }

        /// <summary>
        /// Returns description of enum item
        /// </summary>
        public static string GetEnumDescription(Type enumType, Int64? itemValue)
        {
            if (!itemValue.HasValue)
                return "";
            var itemName = Enum.GetName(enumType, itemValue);
            if (string.IsNullOrEmpty(itemName))
                return "";
            var fi = enumType.GetField(itemName);

            var attributes = (DescriptionAttribute[])fi.GetCustomAttributes(typeof(DescriptionAttribute), false);
            if (attributes.Length > 0)
                return attributes[0].Description;

            var displayAttributes = (DisplayAttribute[])fi.GetCustomAttributes(typeof(DisplayAttribute), false);
            if (displayAttributes.Any())
                return displayAttributes[0].Name;

            return itemName;
        }

        /// <summary>
        /// Returns description of enum item
        /// </summary>
        public static string GetEnumDescription(Type enumType, string itemName)
        {
            var fi = enumType.GetField(itemName);

            if (fi == null)
                return null;

            var attributes = (DescriptionAttribute[])fi.GetCustomAttributes(typeof(DescriptionAttribute), false);
            if (attributes.Length > 0)
                return attributes[0].Description;

            var displayAttributes = (DisplayAttribute[])fi.GetCustomAttributes(typeof(DisplayAttribute), false);
            if (displayAttributes.Any())
                return displayAttributes[0].Name;

            return itemName;
        }

        /// <summary>
        /// Returns attribute of enum item
        /// </summary>
        public static TAttribute GetEnumItemAttribute<TAttribute>(Type enumType, string itemName)
            where TAttribute : Attribute
        {
            var fi = enumType.GetField(itemName);
            return
                (TAttribute)fi.GetCustomAttributes(
                    typeof(TAttribute),
                    false).FirstOrDefault();
        }

        /// <summary>
        /// Indicates is the specified property is a multivalue Reference List property
        /// </summary>
        /// <returns></returns>
        public static bool IsMultiValueReferenceListProperty(this MemberInfo memberInfo)
        {
            return memberInfo.HasAttribute<MultiValueReferenceListAttribute>();
        }

        /// <summary>
        /// Indicates is the specified property uses a Reference List values
        /// </summary>
        /// <returns></returns>
        public static bool IsReferenceListProperty(this MemberInfo memberInfo)
        {
            return GetReferenceListIdentifierOrNull(memberInfo) != null;
        }

        /// <summary>
        /// Returns <see cref="ReferenceListIdentifier"/> for the specified property. Full name 
        /// </summary>
        /// <param name="memberInfo"></param>
        /// <returns></returns>
        public static ReferenceListIdentifier GetReferenceListIdentifierOrNull(this MemberInfo memberInfo)
        {
            // 1. check ReferenceListAttribute on the property
            var refListAttribute = memberInfo.GetAttribute<ReferenceListAttribute>();
            if (refListAttribute != null)
                return refListAttribute.GetReferenceListIdentifier(memberInfo);

            // 2. check MultiValueReferenceListAttribute on the property
            var multiValueAttribute = memberInfo.GetAttribute<MultiValueReferenceListAttribute>();
            if (multiValueAttribute != null)
                return multiValueAttribute.GetReferenceListIdentifier(memberInfo);

            var propertyType = memberInfo.GetPropertyOrFieldType().GetUnderlyingTypeIfNullable();
            if (!propertyType.IsEnum)
                return null;

            // 3. check ReferenceListAttribute on the enum type
            refListAttribute = propertyType.GetAttribute<ReferenceListAttribute>();
            return refListAttribute?.GetReferenceListIdentifier(propertyType);
        }

        private static Type GetPropertyOrFieldType(this MemberInfo propertyOrField)
        {
            if (propertyOrField.MemberType == MemberTypes.Property)
            {
                return ((PropertyInfo)propertyOrField).PropertyType;
            }

            if (propertyOrField.MemberType == MemberTypes.Field)
            {
                return ((FieldInfo)propertyOrField).FieldType;
            }

            throw new ArgumentOutOfRangeException("propertyOrField",
                                                  "Expected PropertyInfo or FieldInfo; found :" + propertyOrField.MemberType);
        }

        /// <summary>
        /// Returns list of selected values for a flag enum
        /// </summary>
        public static IEnumerable<Int64> FlagEnumToListOfValues(Type enumType, long valueToParse)
        {
            foreach (var value in Enum.GetValues(enumType).Cast<object>().Select(o => new {Item = o, Value = Convert.ToInt64(o) }))
            {
                if (GetEnumItemIsVisible(value.Item) && (valueToParse & value.Value) != 0)
                    yield return value.Value;
            }
        }

        #region Class Uid

        /// <summary>
        /// Returns class Uid or null of the specified class. Class Uid can be specified using <see cref="ClassUidAttribute"/>
        /// </summary>
        public static string GetClassUid(this Type type)
        {
            return type.GetAttribute<ClassUidAttribute>()?.Uid;
        }

        #endregion

        /// <summary>
        /// Returns whether this enum item must be shown in enum dropdowns or not
        /// </summary>
        public static bool GetEnumItemIsVisible<TEnum>(TEnum value)
        {
            var fi = value.GetType().GetField(value.ToString());

            if (fi == null)
                return false;

            var displayAttributes = (DisplayAttribute[])fi.GetCustomAttributes(typeof(DisplayAttribute), false);
            var autoGenerateValue = displayAttributes.Any()
                ? displayAttributes[0].GetAutoGenerateField()
                : null;
            return autoGenerateValue ?? true; // By default, show all items
        }

        /// <summary>
        /// Search property with specified name in the current type. Supports dot notation
        /// </summary>
        /// <param name="type">Root type</param>
        /// <param name="propertyName">Name of property, supports dot notation</param>
        /// <param name="useCamelCase">Set to true to compare property names in camel case</param>
        /// <returns></returns>
        public static PropertyInfo GetProperty(this Type type, string propertyName, bool useCamelCase = false)
        {
            var propTokens = propertyName.Split('.');
            var currentType = type;

            for (int i = 0; i < propTokens.Length; i++)
            {
                PropertyInfo propInfo;
                var containerType = currentType.StripCastleProxyType();
                try
                {
                    if (useCamelCase)
                    {
                        var props = containerType.GetProperties().Where(p => p.Name.ToCamelCase() == propTokens[i].ToCamelCase()).ToList();
                        if (props.Count() > 1)
                            throw new AmbiguousMatchException();
                        
                        propInfo = props.FirstOrDefault();
                    } else
                        propInfo = containerType.GetProperty(propTokens[i]);
                }
                catch (AmbiguousMatchException)
                {
                    // Property may have been overriden using the 'new' keyword hence there are multiple properties with the same name.
                    // Will look for the one declared at the highest level.
                    propInfo = ReflectionHelper.FindHighestLevelProperty(propTokens[i], containerType);
                }

                if (propInfo == null)
                    return null;

                if (i == propTokens.Length - 1)
                {
                    return propInfo;
                }
                else
                {
                    currentType = propInfo.PropertyType;
                }
            }

            return null;
        }

        public static bool ImplementsGenericInterface(this Type type, Type interfaceType) 
        {
            return type.GetGenericInterfaces(interfaceType).Any();
        }

        public static IEnumerable<Type> GetGenericInterfaces(this Type type, Type interfaceType)
        {
            return type.GetInterfaces().Where(x => x.IsGenericType && x.GetGenericTypeDefinition() == interfaceType);
        }

        /// <summary>
        /// Returns name of the configurable module current <paramref name="type"/> belongs to
        /// </summary>
        /// <param name="type"></param>
        /// <returns></returns>
        public static string GetConfigurableModuleName(this Type type)
        {
            return type.Assembly.GetConfigurableModuleName();
        }

        /// <summary>
        /// Returns type of the configurable module current <paramref name="type"/> belongs to
        /// </summary>
        /// <param name="type"></param>
        /// <returns></returns>
        public static Type GetConfigurableModuleType(this Type type)
        {
            return type.Assembly.GetConfigurableModuleType();
        }

        /// <summary>
        /// Returns information about the configurable module current <paramref name="type"/> belongs to
        /// </summary>
        /// <returns></returns>
        public static SheshaModuleInfo GetConfigurableModuleInfo(this Type type)
        {
            return type.Assembly.GetConfigurableModuleInfo();
        }

        /// <summary>
        /// Get properties of the specified <paramref name="containerType"/> without hidden ones (https://learn.microsoft.com/en-us/dotnet/csharp/misc/cs0114)
        /// </summary>
        /// <param name="containerType">Type of the container</param>
        /// <param name="bindingAttr">Binding attribute flags</param>
        /// <returns></returns>
        public static List<PropertyInfo> GetPropertiesWithoutHidden(this Type containerType, BindingFlags bindingAttr)
        {
            var propertiesWithoutHiddenOnes = containerType.GetProperties(bindingAttr)
                .GroupBy(prop => prop.Name)
                .Select(group => group.Aggregate((mostSpecificProp, other) => mostSpecificProp.DeclaringType.IsSubclassOf(other.DeclaringType) ? mostSpecificProp : other))
                .ToList();
            return propertiesWithoutHiddenOnes;
        }
    }
}
