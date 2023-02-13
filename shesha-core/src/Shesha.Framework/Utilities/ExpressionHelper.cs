using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;

namespace Shesha.Utilities
{
    /// <summary>
    /// Utility class to get the text from an Expression.
    /// Taken from System.Web.Mvc.ExpressionHelper but modified to support Convert operations.
    /// </summary>
    public static class ExpressionHelper
    {
        public static string GetExpressionText<TEntity, TValue>(Expression<Func<TEntity, TValue>> expression)
        {
            return GetExpressionText((LambdaExpression)expression);
        }

        public static string GetExpressionText(LambdaExpression expression)
        {
            // Split apart the expression string for property/field accessors to create its name 
            Stack<string> nameParts = new Stack<string>();
            Expression part = expression.Body;

            while (part != null)
            {
                if (part.NodeType == ExpressionType.Call)
                {
                    MethodCallExpression methodExpression = (MethodCallExpression)part;

                    if (!IsSingleArgumentIndexer(methodExpression))
                    {
                        break;
                    }

                    nameParts.Push(
                        GetIndexerInvocation(
                            methodExpression.Arguments.Single(),
                            expression.Parameters.ToArray()
                        )
                    );

                    part = methodExpression.Object;
                }
                else if (part.NodeType == ExpressionType.ArrayIndex)
                {
                    BinaryExpression binaryExpression = (BinaryExpression)part;

                    nameParts.Push(
                        GetIndexerInvocation(
                            binaryExpression.Right,
                            expression.Parameters.ToArray()
                        )
                    );

                    part = binaryExpression.Left;
                }
                else if (part.NodeType == ExpressionType.MemberAccess)
                {
                    MemberExpression memberExpressionPart = (MemberExpression)part;
                    nameParts.Push("." + memberExpressionPart.Member.Name);
                    part = memberExpressionPart.Expression;
                }
                else if (part.NodeType == ExpressionType.Convert)
                {
                    // NEW STUFF TO SUPPORT CONVERT (CASTING) OPERATIONS
                    part = ((UnaryExpression)part).Operand;
                }
                else if (part.NodeType == ExpressionType.Parameter)
                {
                    // Dev10 Bug #907611
                    // When the expression is parameter based (m => m.Something...), we'll push an empty 
                    // string onto the stack and stop evaluating. The extra empty string makes sure that
                    // we don't accidentally cut off too much of m => m.Model. 
                    nameParts.Push(String.Empty);
                    part = null;
                }
                else
                {
                    break;
                }
            }

            // If it starts with "model", then strip that away 
            if (nameParts.Count > 0 && String.Equals(nameParts.Peek(), ".model", StringComparison.OrdinalIgnoreCase))
            {
                nameParts.Pop();
            }

            if (nameParts.Count > 0)
            {
                return nameParts.Aggregate((left, right) => left + right).TrimStart('.');
            }

            return String.Empty;
        }

        private static string GetIndexerInvocation(Expression expression, ParameterExpression[] parameters)
        {
            Expression converted = Expression.Convert(expression, typeof(object));
            ParameterExpression fakeParameter = Expression.Parameter(typeof(object), null);
            Expression<Func<object, object>> lambda = Expression.Lambda<Func<object, object>>(converted, fakeParameter);
            Func<object, object> func;

            try
            {
                func = lambda.Compile();
            }
            catch (InvalidOperationException ex)
            {
                throw new InvalidOperationException("Invalid Indexer expresion", ex);
            }

            return "[" + Convert.ToString(func(null), CultureInfo.InvariantCulture) + "]";
        }

        internal static bool IsSingleArgumentIndexer(Expression expression)
        {
            MethodCallExpression methodExpression = expression as MethodCallExpression;
            if (methodExpression == null || methodExpression.Arguments.Count != 1)
            {
                return false;
            }

            return methodExpression.Method
                                   .DeclaringType
                                   .GetDefaultMembers()
                                   .OfType<PropertyInfo>()
                                   .Any(p => p.GetGetMethod() == methodExpression.Method);
        }

        public static Expression<Func<T, bool>> AndAlso<T>(this Expression<Func<T, bool>> expr1, Expression<Func<T, bool>> expr2)
        {
            var parameter = Expression.Parameter(typeof(T));

            var leftVisitor = new ReplaceExpressionVisitor(expr1.Parameters[0], parameter);
            var left = leftVisitor.Visit(expr1.Body);

            var rightVisitor = new ReplaceExpressionVisitor(expr2.Parameters[0], parameter);
            var right = rightVisitor.Visit(expr2.Body);

            return Expression.Lambda<Func<T, bool>>(
                Expression.AndAlso(left, right), parameter);
        }

        public static Expression<Func<T, bool>> OrElse<T>(this Expression<Func<T, bool>> expr1, Expression<Func<T, bool>> expr2)
        {
            var parameter = Expression.Parameter(typeof(T));

            var leftVisitor = new ReplaceExpressionVisitor(expr1.Parameters[0], parameter);
            var left = leftVisitor.Visit(expr1.Body);

            var rightVisitor = new ReplaceExpressionVisitor(expr2.Parameters[0], parameter);
            var right = rightVisitor.Visit(expr2.Body);

            return Expression.Lambda<Func<T, bool>>(
                Expression.OrElse(left, right), parameter);
        }

        private class ReplaceExpressionVisitor
        : ExpressionVisitor
        {
            private readonly Expression _oldValue;
            private readonly Expression _newValue;

            public ReplaceExpressionVisitor(Expression oldValue, Expression newValue)
            {
                _oldValue = oldValue;
                _newValue = newValue;
            }

            public override Expression Visit(Expression node)
            {
                if (node == _oldValue)
                    return _newValue;
                return base.Visit(node);
            }
        }
    }
}
