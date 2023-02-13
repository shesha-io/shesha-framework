using System;
using NHibernate.Mapping.ByCode;

namespace Shesha.NHibernate.Generators
{
    public class GuidAssignedGeneratorDef : IGeneratorDef
    {
        public string Class => typeof(GuidAssignedGenerator).AssemblyQualifiedName;

        public object Params => null;

        public Type DefaultReturnType => typeof(Guid);

        public bool SupportedAsCollectionElementId => true;
    }
}
