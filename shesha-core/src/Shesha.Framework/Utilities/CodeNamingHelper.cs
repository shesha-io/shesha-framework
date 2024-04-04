using Abp.Domain.Entities;
using Shesha.Attributes;
using Shesha.Exceptions;
using Shesha.Extensions;
using Shesha.Modules;
using Shesha.Reflection;
using System;
using System.Collections.Generic;
using System.Reflection;
using System.Text.RegularExpressions;

namespace Shesha.Utilities
{
    /// <summary>
    /// Helper for handling static code rules
    /// </summary>
    public static class CodeNamingHelper
    {
        /// <summary>
        /// Validate specified <paramref name="identifier"/>, throws <see cref="IdentifierIsNotValidException"/> if identifier is not valid
        /// </summary>
        /// <param name="identifier"></param>
        /// <exception cref="IdentifierIsNotValidException"></exception>
        public static void ValidateCodeIdentifier(string identifier)
        {
            if (!CSharpSyntaxHelper.IsValidIdentifier(identifier))
                throw new IdentifierIsNotValidException(identifier);
        }

        /// <summary>
        /// Get accessor (a valid code identifier) based on name and alias.
        /// If <paramref name="alias"/> is specified - validates it and return as is.
        /// If <paramref name="alias"/> is not specified - converts <paramref name="name"/> to camelCase and validates and returns.
        /// </summary>
        /// <param name="name">Object name</param>
        /// <param name="alias">Alias (optional)</param>
        /// <param name="pascalCase">If true, accessor will be in PascalCase otherwise - camelCase</param>
        /// <returns></returns>
        public static string GetAccessor(string name, string alias = null, bool pascalCase = false)
        {
            if (string.IsNullOrWhiteSpace(alias))
            {
                var accessor = CamelCaseHelper.Convert(name, new CamelCaseHelper.ConvertOptions { PascalCase = pascalCase });

                ValidateCodeIdentifier(accessor);
                return accessor;
            }
            else
            {
                ValidateCodeIdentifier(alias);
                return alias;
            }
        }

        /// <summary>
        /// Get module accessor
        /// </summary>
        /// <param name="moduleInfo"></param>
        /// <returns></returns>
        public static string GetModuleAccessor(this SheshaModuleInfo moduleInfo) 
        {
            return GetAccessor(moduleInfo.Name, moduleInfo.Alias);
        }

        /// <summary>
        /// Get property accessor
        /// </summary>
        /// <param name="property"></param>
        /// <returns></returns>
        public static string GetPropertyAccessor(this PropertyInfo property) 
        {
            var aliasAttribute = property.GetAttribute<AliasAttribute>();
            return GetAccessor(property.Name, aliasAttribute?.Alias);
        }

        /// <summary>
        /// Get type accessor
        /// </summary>
        /// <param name="type"></param>
        /// <returns></returns>
        public static string GetTypeAccessor(this Type type) 
        {
            var className = type.StripCastleProxyType().GetUnderlyingTypeIfNullable().Name;
            return ClassName2Accessor(className);
        }

        private static string ClassName2Accessor(string className) 
        {
            return GetAccessor(className, null, true);
        }
    }
}