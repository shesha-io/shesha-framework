using NHibernate.Mapping.ByCode;
using Shesha.Reflection;
using System;

namespace Shesha.NHibernate.Generators
{
    public class GuidAssignedGeneratorDef : IGeneratorDef
    {
        public string Class => typeof(GuidAssignedGenerator).AssemblyQualifiedName.NotNullOrWhiteSpace();

        public object? Params => null;

        public Type DefaultReturnType => typeof(Guid);

        public bool SupportedAsCollectionElementId => true;
    }
}
