using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Abp.Dependency;
using NHibernate.Mapping.ByCode;

namespace Shesha.NHibernate.Maps
{
    // NHibernate mapping-by-code naming convention resembling Fluent's
    // See the blog post: http://notherdev.blogspot.com/2012/01/mapping-by-code-naming-convention.html
    public class ModelMapperWithNamingConventions : ConventionModelMapper
    {
        public const string ForeignKeyColumnPostfix = "Id";
        public const string ManyToManyIntermediateTableInfix = "To";
        public const char ElementColumnTrimmedPluralPostfix = 's';

        private readonly List<MemberInfo> _ignoredMembers = new List<MemberInfo>();

        public ModelMapperWithNamingConventions()
        {
            BeforeMapComponent += DisableComponentParentAutomapping;

            IsPersistentProperty((m, d) =>
            {
                var propertyInfo = m as PropertyInfo;

                var rv = false;
                if (propertyInfo != null)
                    // Re-instate convention that we only map 
                    // to database if property is read/write
                    rv = (
                    propertyInfo.CanRead &&
                    propertyInfo.CanWrite);

                rv = rv && !_ignoredMembers.Contains(m);
                return rv;
            });
        }

        private void DisableComponentParentAutomapping(IModelInspector inspector, PropertyPath member, IComponentAttributesMapper customizer)
        {
            var parentMapping = member.LocalMember.GetPropertyOrFieldType().GetFirstPropertyOfType(member.Owner());
            DisableAutomappingFor(parentMapping);
        }

        private void DisableAutomappingFor(MemberInfo member)
        {
            if (member != null)
                _ignoredMembers.Add(member);
        }
    }

    public static class PropertyPathExtensions
    {
        public static Type Owner(this PropertyPath member)
        {
            return member.GetRootMember().DeclaringType;
        }

        public static Type CollectionElementType(this PropertyPath member)
        {
            return member.LocalMember.GetPropertyOrFieldType().DetermineCollectionElementOrDictionaryValueType();
        }

        public static MemberInfo OneToManyOtherSideProperty(this PropertyPath member)
        {
            return member.CollectionElementType().GetFirstPropertyOfType(member.Owner());
        }

        public static string ManyToManyIntermediateTableName(this PropertyPath member)
        {
            return String.Join(
                ModelMapperWithNamingConventions.ManyToManyIntermediateTableInfix,
                member.ManyToManySidesNames().OrderBy(x => x)
            );
        }

        private static IEnumerable<string> ManyToManySidesNames(this PropertyPath member)
        {
            yield return member.Owner().Name;
            yield return member.CollectionElementType().Name;
        }
    }

}
