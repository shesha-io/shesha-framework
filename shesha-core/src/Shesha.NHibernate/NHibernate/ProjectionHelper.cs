using Shesha.Reflection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;

public static class ProjectionHelper
{
    /// <summary>
    /// Dynamically projects an IQueryable&lt;T&gt; onto a new instance of T,
    /// populating only the specified properties and nested collection projections.
    /// Supports dot notation for nested properties and nested collections.
    /// Example: "Units.Name" projects the Name property of each element in the Units collection.
    /// </summary>
    public static IQueryable<T> SelectProperties<T>(
        this IQueryable<T> source,
        IEnumerable<string> propertyPaths) where T : class, new()
    {
        var parameter = Expression.Parameter(typeof(T), "e");
        var projection = BuildProjectionExpression(parameter, propertyPaths, typeof(T));
        var lambda = Expression.Lambda<Func<T, T>>(projection, parameter);
        return source.Select(lambda);
    }

    /// <summary>
    /// Builds an expression that creates an instance of <paramref name="targetType"/>
    /// and populates it using the given <paramref name="propertyPaths"/> relative to <paramref name="sourceExpr"/>.
    /// Handles both simple properties, nested objects, and nested collections.
    /// </summary>
    private static Expression BuildProjectionExpression(
        Expression sourceExpr,
        IEnumerable<string> propertyPaths,
        Type targetType)
    {
        if (propertyPaths == null || !propertyPaths.Any())
            return Expression.Constant(null, targetType);

        // Group paths by the first segment (immediate property)
        var groups = propertyPaths
            .Select(path => new { Path = path, Parts = path.Split('.') })
            .GroupBy(g => g.Parts[0]);

        // Check if targetType is a collection (IEnumerable<T> and not string)
        if (targetType.IsCollectionType(out var elementType))
        {
            // Collection projection: Select( ... ) + ToList()
            // Subpaths are the remaining parts after the collection property name
            // (they must be processed relative to the element type)
            var sourceCollection = sourceExpr;
            var subPaths = propertyPaths.ToArray(); // all paths are relative to the element type

            // Parameter for the element (e.g., x => ...)
            var elementParam = Expression.Parameter(elementType, "x");
            // Build the inner projection for a single element
            var innerProjection = BuildProjectionExpression(elementParam, subPaths, elementType);

            // Lambda: x => innerProjection
            var selectLambda = Expression.Lambda(innerProjection, elementParam);

            // Enumerable.Select<TSource, TResult> method
            var selectMethod = GetSelectMethod(elementType, elementType);
            var selectCall = Expression.Call(selectMethod, sourceCollection, selectLambda);

            // Enumerable.ToList<TSource> method
            var toListMethod = GetToListMethod(elementType);
            var toListCall = Expression.Call(toListMethod, selectCall);

            return toListCall;
        }
        else
        {
            // Non-collection: build a MemberInit expression (with optional null check for reference types)
            var bindings = new List<MemberBinding>();

            foreach (var group in groups)
            {
                string propName = group.Key;
                var propInfo = targetType.GetProperty(propName,
                    BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);
                if (propInfo == null)
                    throw new ArgumentException($"Property '{propName}' not found on type '{targetType.Name}'");

                // Determine if this group contains only leaf properties (no further dots)
                bool isLeaf = group.All(g => g.Parts.Length == 1);

                if (isLeaf)
                {
                    // Simple property assignment
                    var valueExpr = Expression.Property(sourceExpr, propInfo);
                    bindings.Add(Expression.Bind(propInfo, valueExpr));
                }
                else
                {
                    // Nested (object or collection): collect the subpaths after the current property
                    var subPaths = group
                        .Where(g => g.Parts.Length > 1)
                        .Select(g => string.Join(".", g.Parts.Skip(1)))
                        .Distinct()
                        .ToArray();

                    var sourceNestedExpr = Expression.Property(sourceExpr, propInfo);
                    var nestedProjection = BuildProjectionExpression(sourceNestedExpr, subPaths, propInfo.PropertyType);
                    bindings.Add(Expression.Bind(propInfo, nestedProjection));
                }
            }

            var newExpr = Expression.New(targetType);
            var memberInit = Expression.MemberInit(newExpr, bindings);

            // Null check for reference types (including collections)
            if (!targetType.IsValueType && targetType != typeof(string))
            {
                var condition = Expression.Condition(
                    Expression.Equal(sourceExpr, Expression.Constant(null)),
                    Expression.Constant(null, targetType),
                    memberInit);
                return condition;
            }
            return memberInit;
        }
    }

    private static MethodInfo GetSelectMethod(Type sourceElementType, Type resultElementType)
    {
        return typeof(Enumerable)
            .GetMethods()
            .First(m => m.Name == "Select" && m.GetParameters().Length == 2)
            .MakeGenericMethod(sourceElementType, resultElementType);
    }

    private static MethodInfo GetToListMethod(Type elementType)
    {
        return typeof(Enumerable)
            .GetRequiredMethod("ToList")
            .MakeGenericMethod(elementType);
    }
}
