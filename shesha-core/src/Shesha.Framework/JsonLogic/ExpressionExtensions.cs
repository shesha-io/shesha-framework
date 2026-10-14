using Abp.Authorization;
using Shesha.Permissions.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
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
        /// <param name="permissionedEntityProvider">Will check permissions of properties if provided</param>
        /// <returns></returns>
        public static MemberExpression GetMemberExpression(this ParameterExpression param, string propertyName, IPermissionedEntityProvider permissionedEntityProvider)
        {
            return GetMemberExpression((Expression)param, propertyName, permissionedEntityProvider);
        }

        public static MemberExpression GetMemberExpression(Expression param, string propertyName, IPermissionedEntityProvider permissionedEntityProvider = null)
        {
            if (!propertyName.Contains("."))
            {
                if (permissionedEntityProvider != null)
                {
                    var propInfo = param.Type.GetProperty(propertyName, BindingFlags.Instance | BindingFlags.Public | BindingFlags.IgnoreCase | BindingFlags.FlattenHierarchy);
                    if (propInfo != null && !permissionedEntityProvider.IsPropertyGranted(propInfo))
                        throw new AbpAuthorizationException($"You don't have permission to filter by '{propertyName}' property.");
                }
                return Expression.PropertyOrField(param, propertyName);
            }

            var index = propertyName.IndexOf(".");
            var firstPropertyName = propertyName.Substring(0, index);
            if (permissionedEntityProvider != null)
            {
                var propInfo = param.Type.GetProperty(firstPropertyName, BindingFlags.Instance | BindingFlags.Public | BindingFlags.IgnoreCase | BindingFlags.FlattenHierarchy);
                if (propInfo != null && !permissionedEntityProvider.IsPropertyGranted(propInfo))
                    throw new AbpAuthorizationException($"You don't have permission to filter by '{firstPropertyName}' property.");
            }
            var subParam = Expression.PropertyOrField(param, firstPropertyName);
            return GetMemberExpression(subParam, propertyName.Substring(index + 1), permissionedEntityProvider);
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
