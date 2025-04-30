using Abp.Domain.Entities;
using Abp.Reflection;
using Shesha.Attributes;
using Shesha.Configuration.Runtime.Exceptions;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.EntityReferences;
using Shesha.Exceptions;
using Shesha.Extensions;
using Shesha.Modules;
using Shesha.Services;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Configuration;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Runtime.CompilerServices;

namespace Shesha.Reflection
{
    public static partial class ReflectionHelper
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
            return memberInfo.GetAttributeOrNull<T>() != null;
        }

        public static T? GetUniqueAttribute<T>(this MemberInfo memberInfo) where T : Attribute
        {
            return GetAttributeOrNull<T>(memberInfo);
        }

        public static T? GetAttributeOrNull<T>(this MemberInfo memberInfo, bool inherit = false) where T : Attribute
        {
            return memberInfo.GetCustomAttributes(typeof(T), inherit).Cast<T>().FirstOrDefault();
        }

        public static T GetAttribute<T>(this MemberInfo memberInfo, bool inherit = false) where T : Attribute 
        {
            return memberInfo.GetAttributeOrNull<T>(inherit) ?? throw new MemberHasNoAttributeException(memberInfo, typeof(T));
        }

        public static T? GetAttributeOrNull<T>(this Type type, bool inherit = false) where T : Attribute
        {
            return type.GetCustomAttributes(typeof(T), inherit).Cast<T>().FirstOrDefault();
        }

        public static T GetAttribute<T>(this Type type, bool inherit = false) where T : Attribute 
        {
            return type.GetAttributeOrNull<T>(inherit) ?? throw new TypeHasNoAttributeException(type, typeof(T));
        }

        /// <summary>
        /// Returns extended info about specified property.
        /// </summary>
        /// <param name="obj">Object whose property value is to be retreived.</param>
        /// <param name="propertyName">Name of the property or property hierarchy </param>
        public static PropertyValueAccessor GetPropertyValueAccessor(object obj, string propertyName) 
        {
            var propInfo = GetPropertyOrNull(obj, propertyName, out var parent);
            return new PropertyValueAccessor(propInfo, parent);
        }

        public static object? GetPropertyValue(object obj, string propertyName, object? defaultValue)
        {
            if (obj == null)
                return null;
            var propInfo = obj.GetType().GetProperty(propertyName);

            return propInfo == null ? defaultValue : propInfo.GetValue(obj, null) ?? defaultValue;
        }

        #region GetProperty

        public static PropertyInfo? GetProperty(object entity, string propertyName)
        {
            return GetPropertyOrNull(entity, propertyName, out var propertyEntity);
        }

        public static PropertyInfo GetProperty(object entity, string propertyName, out object propertyEntity) 
        {
            var property = GetPropertyOrNull(entity, propertyName, out var owner);
            if (property == null)
                throw new PropertyNotFoundException(entity.GetType(), propertyName);
            
            propertyEntity = owner.NotNull();
            return property;
        }

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
        public static PropertyInfo? GetPropertyOrNull(object entity, string propertyName, out object? propertyEntity)
        {
            var propTokens = propertyName.Split('.');
            var currentEntity = entity;
            Type currentType = entity.GetType();

            for (int i = 0; i < propTokens.Length; i++)
            {
                PropertyInfo? propInfo;
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

        private static PropertyInfo? GetHighestLevelPropertyOrNull(string propertyName, Type entityType) 
        {
            var propInfo = entityType.GetProperties()
                .FirstOrDefault(prop => prop.Name.Equals(propertyName, StringComparison.InvariantCultureIgnoreCase)
                                        && prop.DeclaringType == entityType);

            if (propInfo == null)
                return entityType.BaseType != null
                    ? GetHighestLevelPropertyOrNull(propertyName, entityType.BaseType)
                    : null;
            else
                return propInfo;
        }

        /// <summary>
        /// Find property with name <paramref name="propertyName"/> at the highest position of class hierarchy of type <paramref name="entityType"/>
        /// </summary>
        /// <exception cref="PropertyNotFoundException"></exception>
        public static PropertyInfo FindHighestLevelProperty(string propertyName, Type entityType)
        {
            return GetHighestLevelPropertyOrNull(propertyName, entityType) ?? throw new PropertyNotFoundException(entityType, propertyName);
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
            var strippers = StaticContext.IocManager.ResolveAll<IProxyStripper>();
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
        public static PropertyInfo? FindPropertyWithUniqueAttribute(Type type, Type attributeType)
        {
            return FindPropertyWithUniqueAttribute(type, attributeType, null);
        }

        public static T? Cast<T>(object entity) where T : class
        {
            return entity as T;
        }

        public static PropertyInfo? FindPropertyWithUniqueAttribute(Type type, Type attributeType, Type? expectedPropertyType)
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
                ? !property.HasAttribute<RequiredMemberAttribute>()
                : property.PropertyType.IsNullableType() || property.HasAttribute<NullableAttribute>();
        }

        /// <summary>
        /// Checks to see if the specified type is Nullable and if so returns its underlying type, 
        /// otherwise returns the original type.
        /// </summary>
        public static Type GetUnderlyingTypeIfNullable(this Type type)
        {
            return Nullable.GetUnderlyingType(type) ?? type;
        }

        /// <summary>
        /// Indicates is the specified type an enum or nullable enum
        /// </summary>
        /// <param name="type">Type to check</param>
        /// <returns></returns>
        public static bool IsEnumType(this Type type)
        {
            return GetUnderlyingTypeIfNullable(type).IsEnum;
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
            if (exp is MemberExpression memberExpression)
            {
                if (string.IsNullOrEmpty(propertyName))
                    propertyName = memberExpression.Member.Name;
                else
                    propertyName = memberExpression.Member.Name + "." + propertyName;

                PrependExpressionComponent(memberExpression.Expression.NotNull($"{nameof(memberExpression.Expression)} must not be null"), ref propertyName);
            }
            else if (exp is UnaryExpression unaryExpression)
            {
                PrependExpressionComponent(unaryExpression.Operand, ref propertyName);
            }
            else if (exp.NodeType == ExpressionType.Parameter)
            {
                // Have reached the input parameter.
            }
            else
            {
                throw new ArgumentException($"Expressions of type '{exp.NodeType}' are not supported");
            }
        }

        /// <summary>
        /// Return category name of the specified <paramref name="member"/>. 
        /// If the member is decorated with <see cref="CategoryAttribute"/> - returns <see cref="CategoryAttribute.Category"/>
        /// If the member is decorated with <see cref="DisplayAttribute"/> - returns <see cref="DisplayAttribute.GroupName"/>
        /// </summary>
        public static string? GetCategory(this MemberInfo member)
        {
            var categoryAttribute = member.GetAttributeOrNull<CategoryAttribute>();
            if (categoryAttribute != null)
                return categoryAttribute.Category;

            var displayAttribute = member.GetAttributeOrNull<DisplayAttribute>();
            return displayAttribute?.GetGroupName();
        }

        /// <summary>
        /// Return display name of the specified member
        /// </summary>
        public static string GetDisplayName(this MemberInfo property)
        {
            var displayAttribute = property.GetAttributeOrNull<DisplayAttribute>();

            return displayAttribute?.GetName() ?? property.Name.ToFriendlyName();
        }

        /// <summary>
        /// Return description of the specified member
        /// </summary>
        public static string? GetDescription(this MemberInfo property)
        {
            var descriptionAttribute = property.GetAttributeOrNull<DescriptionAttribute>();
            var displayAttribute = property.GetAttributeOrNull<DisplayAttribute>();

            var description = descriptionAttribute?.Description;
            if (string.IsNullOrWhiteSpace(description))
                description = displayAttribute?.GetDescription();

            return description;
        }

        /// <summary>
        /// Returns description of enum item
        /// </summary>
        public static string? GetEnumDescription(Type enumType, Int64? itemValue)
        {
            if (!itemValue.HasValue)
                return "";
            var itemName = Enum.GetName(enumType, itemValue);
            if (string.IsNullOrEmpty(itemName))
                return "";
            var fi = enumType.GetRequiredField(itemName);

            var attributes = (DescriptionAttribute[])fi.GetCustomAttributes(typeof(DescriptionAttribute), false);
            if (attributes.Length > 0)
                return attributes[0].Description;

            var displayAttributes = (DisplayAttribute[])fi.GetCustomAttributes(typeof(DisplayAttribute), false);
            if (displayAttributes.Any())
                return displayAttributes[0].Name;

            return itemName;
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
        public static ReferenceListIdentifier? GetReferenceListIdentifierOrNull(this MemberInfo memberInfo)
        {
            // 1. check ReferenceListAttribute on the property
            var refListAttribute = memberInfo.GetAttributeOrNull<ReferenceListAttribute>();
            if (refListAttribute != null)
                return refListAttribute.GetReferenceListIdentifier(memberInfo);

            // 2. check MultiValueReferenceListAttribute on the property
            var multiValueAttribute = memberInfo.GetAttributeOrNull<MultiValueReferenceListAttribute>();
            if (multiValueAttribute != null)
                return multiValueAttribute.GetReferenceListIdentifier(memberInfo);

            var propertyType = memberInfo.GetPropertyOrFieldType().GetUnderlyingTypeIfNullable();
            if (!propertyType.IsEnum)
                return null;

            // 3. check ReferenceListAttribute on the enum type
            refListAttribute = propertyType.GetAttributeOrNull<ReferenceListAttribute>();
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

        #region Class Uid

        /// <summary>
        /// Returns class Uid or null of the specified class. Class Uid can be specified using <see cref="ClassUidAttribute"/>
        /// </summary>
        public static string? GetClassUid(this Type type)
        {
            return type.GetAttributeOrNull<ClassUidAttribute>()?.Uid;
        }

        #endregion

        /// <summary>
        /// Search property with specified name in the current type. Supports dot notation
        /// </summary>
        /// <param name="type">Root type</param>
        /// <param name="propertyName">Name of property, supports dot notation</param>
        /// <param name="useCamelCase">Set to true to compare property names in camel case</param>
        /// <returns></returns>
        public static PropertyInfo? GetProperty(this Type type, string propertyName, bool useCamelCase = false)
        {
            var propTokens = propertyName.Split('.');
            var currentType = type;

            for (int i = 0; i < propTokens.Length; i++)
            {
                PropertyInfo? propInfo;
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
                    propInfo = FindHighestLevelProperty(propTokens[i], containerType);
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
        public static string? GetConfigurableModuleName(this Type type)
        {
            return type.Assembly.GetConfigurableModuleName();
        }

        /// <summary>
        /// Returns type of the configurable module current <paramref name="type"/> belongs to
        /// </summary>
        /// <param name="type"></param>
        /// <returns></returns>
        public static Type? GetConfigurableModuleType(this Type type)
        {
            return type.Assembly.GetConfigurableModuleType();
        }

        /// <summary>
        /// Returns information about the configurable module current <paramref name="type"/> belongs to
        /// </summary>
        /// <returns></returns>
        public static SheshaModuleInfo? GetConfigurableModuleInfo(this Type type)
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
                .Select(group => group.Aggregate((mostSpecificProp, other) => mostSpecificProp.DeclaringType.NotNull().IsSubclassOf(other.DeclaringType.NotNull()) ? mostSpecificProp : other))
                .ToList();
            return propertiesWithoutHiddenOnes;
        }

        /// <summary>
        /// Get extension methods of the specified <paramref name="extendedType"/> declared in a specified <paramref name="assembly"/>
        /// </summary>
        /// <param name="assembly">Assembly to search extension methods in</param>
        /// <param name="extendedType">Type to search extended methods for</param>
        /// <returns></returns>
        public static List<MethodInfo> GetExtensionMethods(Assembly assembly, Type extendedType)
        {
            var isGenericTypeDefinition = extendedType.IsGenericType && extendedType.IsTypeDefinition;

            var types = assembly.GetTypes().Where(type => type.IsSealed && !type.IsGenericType && !type.IsNested).ToList();
            var result = new List<MethodInfo>();

            foreach (var type in types)
            {
                var methods = type.GetMethods(BindingFlags.Static | BindingFlags.Public | BindingFlags.NonPublic)
                    .Where(method =>
                    {
                        var firstParam = method.GetParameters().FirstOrDefault();

                        return method.IsDefined(typeof(ExtensionAttribute), false) &&
                            firstParam != null &&
                            (isGenericTypeDefinition
                                ? firstParam.ParameterType.IsGenericType && firstParam.ParameterType.GetGenericTypeDefinition().IsAssignableFrom(extendedType)
                                : firstParam.ParameterType.IsAssignableFrom(extendedType));
                    })
                    .ToList();
                result.AddRange(methods);
            }

            return result;
        }

        public static List<MethodInfo> GetExtensionMethods(IAssemblyFinder assemblyFinder, Type extendedType) 
        {
            return assemblyFinder.GetAllAssemblies().SelectMany(a => GetExtensionMethods(a, extendedType)).ToList();
        }

        public static List<Type> GetExtensionTypes(Assembly assembly, Type extendedType)
        {
            var methods = GetExtensionMethods(assembly, extendedType);
            return methods.Select(method => method.DeclaringType).Distinct().OfType<Type>().ToList();
        }

        /// <summary>
        /// Cast <paramref name="source"/> to type <typeparamref name="TDestination"/>. An exception will be throws on unsuccessfull casting
        /// </summary>
        /// <typeparam name="TDestination"></typeparam>
        /// <param name="source"></param>
        /// <returns></returns>
        /// <exception cref="InvalidCastException"></exception>
        public static TDestination ForceCastAs<TDestination>(this object? source) where TDestination : class 
        {
            if (source is TDestination dest)
                return dest;

            if (source is GenericEntityReference genericEntity && typeof(Entity<Guid>).IsAssignableFrom(typeof(TDestination))) {
                var entity = (Entity<Guid>)genericEntity.NotNull();
                return entity.ForceCastAs<TDestination>();
            }

            throw new InvalidCastException(source != null
                ? $"Failed to cast value of type '{source.GetType().FullName}' to type '{typeof(TDestination).FullName}'"
                : "Failed to cast null to type '{typeof(TDestination).FullName}'"
            );
        }

        /// <summary>
        /// Invoke method <paramref name="method"/> and return typed result. Throws exception when result is of wrong type
        /// </summary>
        /// <typeparam name="TResult"></typeparam>
        /// <param name="method"></param>
        /// <param name="obj"></param>
        /// <param name="parameters"></param>
        /// <returns></returns>
        public static TResult? Invoke<TResult>(this MethodBase method, object? obj, object?[]? parameters) where TResult : class
        { 
            var result = method.Invoke(obj, parameters);
            return result != null
                ? result.ForceCastAs<TResult>()
                : null;
        }

        public static T NotNull<T>([NotNull]this T? value, string message = "Value must not be null")
        {
            return value ?? throw new Exception(message);
        }

        /// <summary>
        /// Guarantee that current string is not null or whitespace
        /// </summary>
        /// <param name="value"></param>
        /// <param name="message"></param>
        /// <returns></returns>
        /// <exception cref="Exception"></exception>
        public static string NotNullOrWhiteSpace([NotNull] this string? value, string message = "String must not be null or empty")
        {
            return !string.IsNullOrWhiteSpace(value) 
                ? value
                : throw new Exception(message);
        }

        /// <summary>
        /// Get method by name. Throws <see cref="MethodNotFoundException"/> if method not found
        /// </summary>
        /// <param name="type">Type to search method in</param>
        /// <param name="name">Method name</param>
        /// <param name="types">Argument types</param>
        /// <returns></returns>
        /// <exception cref="MethodNotFoundException"></exception>
        public static MethodInfo GetRequiredMethod(this Type type, string name, Type[] types)
        { 
            return type.GetMethod(name, types) ?? throw new MethodNotFoundException(type, name);
        }

        /// <summary>
        /// Get method by name. Throws <see cref="MethodNotFoundException"/> if method not found
        /// </summary>
        /// <param name="type">Type to search method in</param>
        /// <param name="name">Method name</param>
        /// <param name="bindingAttr">A bitwise combination of the enumeration values that specify how the search is conducted.</param>
        /// <returns></returns>
        /// <exception cref="MethodNotFoundException"></exception>
        public static MethodInfo GetRequiredMethod(this Type type, string name, BindingFlags bindingAttr)
        {
            return type.GetMethod(name, bindingAttr) ?? throw new MethodNotFoundException(type, name);
        }

        /// <summary>
        /// Get method by name. Throws <see cref="MethodNotFoundException"/> if method not found
        /// </summary>
        /// <param name="type">Type to search method in</param>
        /// <param name="name">Method name</param>
        /// <returns></returns>
        /// <exception cref="MethodNotFoundException"></exception>
        public static MethodInfo GetRequiredMethod(this Type type, string name)
        {
            return type.GetMethod(name) ?? throw new MethodNotFoundException(type, name);
        }

        /// <summary>
        /// Get property by name. Throws <see cref="MethodNotFoundException"/> if property not found
        /// </summary>
        /// <param name="type">Type to search property in</param>
        /// <param name="propertyName">Property name</param>
        /// <returns></returns>
        /// <exception cref="PropertyNotFoundException"></exception>
        public static PropertyInfo GetRequiredProperty(this Type type, string propertyName) 
        {
            return type.GetProperty(propertyName) ?? throw new PropertyNotFoundException(type, propertyName);
        }

        public static FieldInfo GetRequiredField(this Type type, string fieldName)
        {
            return type.GetField(fieldName) ?? throw new FieldNotFoundException(type, fieldName);
        }
    }
}
