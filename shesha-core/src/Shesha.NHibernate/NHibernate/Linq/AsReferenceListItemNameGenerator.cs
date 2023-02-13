using NHibernate.Hql.Ast;
using NHibernate.Linq.Functions;
using NHibernate.Linq.Visitors;
using NHibernate.Util;
using Shesha.Reflection;
using System;
using System.Collections.ObjectModel;
using System.Linq.Expressions;
using System.Reflection;

namespace Shesha.NHibernate.Linq
{
    /// <summary>
    /// Implementation of `AsReferenceListItemName` function
    /// </summary>
    public class AsReferenceListItemNameGenerator : BaseHqlGeneratorForMethod
    {
        /// <summary>
        /// Default constructor
        /// </summary>
        public AsReferenceListItemNameGenerator()
        {
            SupportedMethods = new[]
            {
                ReflectHelper.GetMethodDefinition(() => SheshaNhibernateLinqExtensions.AsReferenceListItemName(0)),
                ReflectHelper.GetMethodDefinition(() => SheshaNhibernateLinqExtensions.AsReferenceListItemName((Int64?)null))
            };
        }

        /// inheritedDoc
        public override HqlTreeNode BuildHql(MethodInfo method,
            Expression targetObject,
            ReadOnlyCollection<Expression> arguments,
            HqlTreeBuilder treeBuilder,
            IHqlExpressionVisitor visitor)
        {
            var firstArgument = visitor.Visit(arguments[0]).AsExpression();

            if (arguments[0] is MemberExpression member)
            {
                var refList = ReflectionHelper.GetReferenceListIdentifierOrNull(member.Member);

                if (refList != null)
                    return treeBuilder.MethodCall("dbo.Frwk_GetRefListItem", treeBuilder.Constant(refList.Module), treeBuilder.Constant(refList.Name), firstArgument);
            }

            return visitor.Visit(arguments[0]).AsExpression();
        }
    }
}
