using Abp.Specifications;
using Shesha.Extensions;
using Shesha.Reflection;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Shesha.Specifications
{
    /// <summary>
    /// Specifications helper
    /// </summary>
    public static class SpecificationsHelper
    {
        /// <summary>
        /// Get specifications info for specified <paramref name="specificationType"/>
        /// </summary>
        /// <param name="specificationType">Type of specifications</param>
        /// <returns></returns>
        public static List<SpecificationInfo> GetSpecificationsInfo(Type specificationType) 
        {
            var entityTypes = specificationType.GetInterfaces()
                        .Where(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(ISpecification<>))
                        .Select(i => i.GenericTypeArguments.First())
                        .ToList();
            return entityTypes.Select(et => new SpecificationInfo
            {
                SpecificationsType = specificationType,
                EntityType = et,

                Name = specificationType.FullName,
                FriendlyName = ReflectionHelper.GetDisplayName(specificationType),
                Description = specificationType.GetDescription(),
                IsGlobal = specificationType.IsGlobalSpecificationType(),
            }).ToList();
        }

        /// <summary>
        /// Returns true if the specified <paramref name="type"/> implements <see cref="ISpecification{T}"/>
        /// </summary>
        /// <param name="type"></param>
        public static bool IsSpecificationType(this Type type)
        {
            return type.GetInterfaces().Any(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(ISpecification<>));
        }

        /// <summary>
        /// Returns true if the specified <paramref name="type"/> is marked with the <see cref="GlobalSpecificationAttribute"/>
        /// </summary>
        /// <param name="type"></param>
        /// <returns></returns>
        public static bool IsGlobalSpecificationType(this Type type) 
        {
            return type.HasAttribute<GlobalSpecificationAttribute>();
        }        
    }
}
