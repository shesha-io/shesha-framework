using Abp.Authorization;
using Shesha.Permissions.Entity;
using Shesha.Reflection;
using Shesha.Services;
using Shesha.Utilities;
using System;
using System.Linq;
using System.Reflection;

namespace Shesha.Extensions
{
    /// <summary>
    /// Validates user-supplied sort strings before they are passed to LINQ
    /// OrderBy / ThenBy. Sort strings follow the dynamic LINQ format
    /// "Property1 [asc|desc][, Property2 [asc|desc] ...]" and may use dot
    /// notation to traverse navigation properties.
    /// </summary>
    public static class SortingValidator
    {
        /// <summary>
        /// Throws if any segment of any column in <paramref name="sorting"/> targets
        /// a property marked with [JsonIgnore] (Newtonsoft or System.Text.Json).
        /// Without this check, dynamic LINQ sorting can traverse navigation
        /// properties to leak ordering information about sensitive fields
        /// (e.g. password hashes) — see issue #4774.
        /// </summary>
        public static void EnsureSortingAllowed(Type entityType, string sorting, IPermissionedEntityProvider permissionedEntityProvider = null)
        {
            if (string.IsNullOrWhiteSpace(sorting) || entityType == null)
                return;

            foreach (var sortColumn in sorting.Split(','))
            {
                var trimmed = sortColumn.Trim();
                if (string.IsNullOrEmpty(trimmed))
                    continue;

                var path = trimmed.LeftPart(' ', ProcessDirection.LeftToRight);
                if (string.IsNullOrEmpty(path))
                    continue;

                EnsurePathAllowed(entityType, path, permissionedEntityProvider);
            }
        }

        private static void EnsurePathAllowed(Type rootType, string propertyPath, IPermissionedEntityProvider permissionedEntityProvider)
        {
            var currentType = rootType;
            foreach (var segment in propertyPath.Split('.'))
            {
                if (currentType == null || string.IsNullOrEmpty(segment))
                    return;

                var prop = currentType
                    .GetProperties(BindingFlags.Public | BindingFlags.Instance)
                    .FirstOrDefault(p => string.Equals(p.Name, segment, StringComparison.OrdinalIgnoreCase));

                if (prop == null)
                    return;

                if (permissionedEntityProvider != null && !permissionedEntityProvider.IsPropertyGranted(prop))
                    throw new AbpAuthorizationException($"You don't have permission to order by '{propertyPath}' property.");

                if (prop.IsJsonIgnored())
                    throw new ArgumentException($"Sorting by '{propertyPath}' is not allowed: property '{propertyPath}' is not sortable.", nameof(propertyPath));

                currentType = prop.PropertyType;
            }
        }
    }
}
