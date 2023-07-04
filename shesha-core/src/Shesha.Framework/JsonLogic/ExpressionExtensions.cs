using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.JsonLogic
{
    /// <summary>
    /// Expression extensions
    /// </summary>
    public static class ExpressionExtensions
    {
        /// <summary>
        /// Adds a "null check" to the expression (before the original one).
        /// </summary>
        /// <param name="expression">Expression to which the null check will be pre-pended.</param>
        /// <param name="member">Member that will be checked.</param>
        /// <returns></returns>
        public static Expression AddNullCheck(this Expression expression, Expression member)
        {
            if (!IsNullableExpression(member))
                return expression;

            Expression memberIsNotNull = Expression.NotEqual(member, Expression.Constant(null));
            return Expression.AndAlso(memberIsNotNull, expression);
        }

        public static bool IsNullableExpression(Expression expression)
        {
            return expression.Type.IsGenericType && expression.Type.GetGenericTypeDefinition() == typeof(Nullable<>);
        }

        /// <summary>
        /// Gets a member expression for an specific property
        /// </summary>
        /// <param name="param"></param>
        /// <param name="propertyName"></param>
        /// <returns></returns>
        public static MemberExpression GetMemberExpression(this ParameterExpression param, string propertyName)
        {
            return GetMemberExpression((Expression)param, propertyName);
        }

        public static MemberExpression GetMemberExpression(Expression param, string propertyName)
        {
            if (!propertyName.Contains("."))
            {
                return Expression.PropertyOrField(param, propertyName);
            }

            var index = propertyName.IndexOf(".");
            var subParam = Expression.PropertyOrField(param, propertyName.Substring(0, index));
            return GetMemberExpression(subParam, propertyName.Substring(index + 1));
        }

        /// <summary>
        /// Replace <paramref name="parameter"/> parameter to <paramref name="newParameter"/> in the <paramref name="expression"/>
        /// </summary>
        /// <param name="expression">Expression</param>
        /// <param name="parameter">Parameter to be replaced</param>
        /// <param name="newParameter">New parameter</param>
        /// <returns></returns>
        public static Expression ReplaceParameter(this Expression expression, ParameterExpression parameter, Expression newParameter)
        {
            return new ExpressionParameterReplaceVisitor(parameter, newParameter).Visit(expression);
        }
    }
}
