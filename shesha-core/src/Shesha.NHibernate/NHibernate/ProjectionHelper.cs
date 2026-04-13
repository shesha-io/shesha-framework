using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;

namespace Shesha.NHibernate
{
    public static class ProjectionHelper
    {
        /// <summary>
        /// Dynamically projects an IQueryable&lt;T&gt; onto a new instance of T,
        /// populating only the specified properties (supports dot notation for nested properties).
        /// Handles null intermediate objects by setting the target to null.
        /// </summary>
        public static IQueryable<T> SelectProperties<T>(
            this IQueryable<T> source,
            IEnumerable<string> propertyPaths) where T : class, new()
        {
            var parameter = Expression.Parameter(typeof(T), "e");
            var bindings = BuildMemberBindings(parameter, propertyPaths, typeof(T));
            var memberInit = Expression.MemberInit(Expression.New(typeof(T)), bindings);
            var lambda = Expression.Lambda<Func<T, T>>(memberInit, parameter);
            return source.Select(lambda);
        }

        private static List<MemberBinding> BuildMemberBindings(
            Expression sourceParameter,
            IEnumerable<string> propertyPaths,
            Type rootType)
        {
            var groups = propertyPaths
                .Select(path => new { Path = path, Parts = path.Split('.') })
                .GroupBy(g => g.Parts[0]);

            var bindings = new List<MemberBinding>();

            foreach (var group in groups)
            {
                string topProp = group.Key;
                var topPropInfo = rootType.GetProperty(topProp,
                    BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);
                if (topPropInfo == null)
                    throw new ArgumentException($"Property '{topProp}' not found on type '{rootType.Name}'");

                bool isSimple = group.All(g => g.Parts.Length == 1);
                if (isSimple)
                {
                    // Direct property access (e.g., "Id", "Name")
                    var valueExpr = Expression.Property(sourceParameter, topPropInfo);
                    bindings.Add(Expression.Bind(topPropInfo, valueExpr));
                    continue;
                }

                // Nested: collect sub-paths (e.g., "City", "Id" for "Address.City", "Address.Id")
                var subPaths = group
                    .Where(g => g.Parts.Length > 1)
                    .Select(g => string.Join(".", g.Parts.Skip(1)))
                    .Distinct()
                    .ToArray();

                // Build expression that creates the nested object (or null if source is null)
                var sourceExpr = Expression.Property(sourceParameter, topPropInfo);
                var nestedExpr = BuildNestedMemberInit(sourceExpr, subPaths, topPropInfo.PropertyType);
                bindings.Add(Expression.Bind(topPropInfo, nestedExpr));
            }

            return bindings;
        }

        private static Expression BuildNestedMemberInit(
            Expression sourceExpr,
            string[] subPaths,
            Type targetType)
        {
            // If the target type is a value type (cannot be null), we don't need a null check.
            // But typically nested entities are reference types.
            bool isReferenceType = !targetType.IsValueType;

            // Group sub-paths by the immediate next property
            var groups = subPaths
                .Select(path => new { Path = path, Parts = path.Split('.') })
                .GroupBy(g => g.Parts[0]);

            var bindings = new List<MemberBinding>();

            foreach (var group in groups)
            {
                string propName = group.Key;
                var propInfo = targetType.GetProperty(propName,
                    BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);
                if (propInfo == null)
                    throw new ArgumentException($"Property '{propName}' not found on type '{targetType.Name}'");

                bool isLeaf = group.All(g => g.Parts.Length == 1);
                if (isLeaf)
                {
                    // Leaf property: e.g., "City" or "Id"
                    var valueExpr = Expression.Property(sourceExpr, propInfo);
                    bindings.Add(Expression.Bind(propInfo, valueExpr));
                }
                else
                {
                    // Deeper nesting: recursively build the inner object
                    var deeperPaths = group
                        .Where(g => g.Parts.Length > 1)
                        .Select(g => string.Join(".", g.Parts.Skip(1)))
                        .ToArray();
                    var innerExpr = BuildNestedMemberInit(
                        Expression.Property(sourceExpr, propInfo),
                        deeperPaths,
                        propInfo.PropertyType);
                    bindings.Add(Expression.Bind(propInfo, innerExpr));
                }
            }

            // Create the MemberInit expression for the nested object
            var newExpr = Expression.New(targetType);
            var memberInit = Expression.MemberInit(newExpr, bindings);

            if (!isReferenceType)
                return memberInit; // value types can't be null

            // For reference types, wrap with a null check: sourceExpr == null ? null : memberInit
            var nullConstant = Expression.Constant(null, targetType);
            var condition = Expression.Condition(
                Expression.Equal(sourceExpr, Expression.Constant(null)),
                nullConstant,
                memberInit);
            return condition;
        }
    }
}
