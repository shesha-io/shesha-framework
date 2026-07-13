using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using NHibernate;
using NHibernate.Engine;
using NHibernate.Linq;

namespace Shesha.NHibernate.Linq 
{
    public sealed class SheshaLinqQueryProvider : DefaultQueryProvider
    {
#if NET9_0_OR_GREATER
        private static readonly MemoryExtensionsVisitor _visitor = new MemoryExtensionsVisitor();
#endif

        public SheshaLinqQueryProvider(ISessionImplementor session) : base(session) { }

        public SheshaLinqQueryProvider(ISessionImplementor session, object collection) : base(session, collection) { }

        public SheshaLinqQueryProvider(ISessionImplementor session, object collection, NhQueryableOptions options) : base(session, collection, options) { }

        protected override IQueryProvider CreateWithOptions(NhQueryableOptions options)
        {
            return new SheshaLinqQueryProvider(Session, Collection, options);
        }

        protected override NhLinqExpression PrepareQuery(Expression expression, out IQuery query)
        {
#if NET9_0_OR_GREATER
            expression = _visitor.Visit(expression);
#endif

            return base.PrepareQuery(expression, out query);
        }

        public override IQueryable CreateQuery(Expression expression)
        {
#if NET9_0_OR_GREATER
            expression = _visitor.Visit(expression);
#endif

            return base.CreateQuery(expression);
        }

        public override IQueryable<T> CreateQuery<T>(Expression expression)
        {
#if NET9_0_OR_GREATER
            expression = _visitor.Visit(expression);
#endif

            return base.CreateQuery<T>(expression);
        }

#if NET9_0_OR_GREATER
        private sealed class MemoryExtensionsVisitor : ExpressionVisitor
        {
            private static readonly MethodInfo _contains;

            private static readonly MethodInfo _sequenceEqual;

            protected override Expression VisitMethodCall(MethodCallExpression node)
            {
                var method = node.Method;

                if (method.DeclaringType != typeof(MemoryExtensions))
                {
                    return base.VisitMethodCall(node);
                }

                // .NET 10 made changes to overload resolution to prefer Span-based overloads when those exist ("first-class spans").
                // Unfortunately, the LINQ interpreter does not support ref structs, so we rewrite e.g. MemoryExtensions.Contains to
                // Enumerable.Contains here.
                // Code below taken and adapted from to EFCore solution
                switch (method.Name)
                {
                    // Note that MemoryExtensions.Contains has an optional 3rd ComparisonType parameter; we only match when
                    // it's null.
                    case nameof(MemoryExtensions.Contains)
                        when node.Arguments is [var spanArg, var valueArg, ..] &&
                             (node.Arguments.Count is 2 ||
                              node.Arguments.Count is 3 && node.Arguments[2] is ConstantExpression { Value: null }) &&
                             TryUnwrapSpanImplicitCast(spanArg, out var unwrappedSpanArg):
                        {
                            return Visit(
                                Expression.Call(
                                    _contains.MakeGenericMethod(method.GetGenericArguments()[0]),
                                    unwrappedSpanArg,
                                    valueArg));
                        }

                    case nameof(MemoryExtensions.SequenceEqual)
                        when node.Arguments is [var spanArg, var otherArg] &&
                             TryUnwrapSpanImplicitCast(spanArg, out var unwrappedSpanArg) &&
                             TryUnwrapSpanImplicitCast(otherArg, out var unwrappedOtherArg):
                        return Visit(
                            Expression.Call(
                                _sequenceEqual.MakeGenericMethod(method.GetGenericArguments()[0]),
                                unwrappedSpanArg,
                                unwrappedOtherArg));
                    default:
                        throw new NotSupportedException(
                            $"The method '{method}' is not supported by the LINQ to NHibernate provider.");
                }

                static bool TryUnwrapSpanImplicitCast(Expression expression, [NotNullWhen(true)] out Expression? result)
                {
                    if (expression is MethodCallExpression
                        {
                            Method:
                            {
                                Name: "op_Implicit", DeclaringType: { IsGenericType: true } implicitCastDeclaringType
                            },
                            Arguments: [var unwrapped]
                        } &&
                        implicitCastDeclaringType.GetGenericTypeDefinition() is var genericTypeDefinition &&
                        (genericTypeDefinition == typeof(Span<>) || genericTypeDefinition == typeof(ReadOnlySpan<>)))
                    {
                        // nHibernate does not like it when there is a convert to the same type, so we remove it here.
                        if (unwrapped is UnaryExpression { NodeType: ExpressionType.Convert } u && u.Type == u.Operand.Type)
                        {
                            result = u.Operand;
                        }
                        else
                        {
                            result = unwrapped;
                        }

                        return true;
                    }

                    result = null;
                    return false;
                }
            }

            /// <summary>
            /// Initialise the lookups for Enumerable methods.
            /// </summary>
            static MemoryExtensionsVisitor()
            {
                var queryableMethodGroups = typeof(Enumerable)
                    .GetMethods(BindingFlags.Public | BindingFlags.Static | BindingFlags.DeclaredOnly)
                    .GroupBy(mi => mi.Name)
                    .ToDictionary(e => e.Key, l => l.ToList());

                _contains = GetMethod(
                    nameof(Enumerable.Contains),
                    1,
                    types => [typeof(IEnumerable<>).MakeGenericType(types[0]), types[0]]);

                _sequenceEqual = GetMethod(
                    nameof(Enumerable.SequenceEqual),
                    1,
                    types =>
                    [
                        typeof(IEnumerable<>).MakeGenericType(types[0]), typeof(IEnumerable<>).MakeGenericType(types[0])
                    ]);
                return;

                MethodInfo GetMethod(
                    string name,
                    int genericParameterCount,
                    Func<System.Type[], System.Type[]> parameterGenerator)
                {
                    return queryableMethodGroups[name].Single(mi =>
                        ((genericParameterCount == 0 && !mi.IsGenericMethod) ||
                         (mi.IsGenericMethod && mi.GetGenericArguments().Length == genericParameterCount)) &&
                        mi.GetParameters().Select(e => e.ParameterType).SequenceEqual(
                            parameterGenerator(mi.IsGenericMethod ? mi.GetGenericArguments() : [])));
                }
            }
        }
#endif
    }
}

