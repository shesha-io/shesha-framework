using Abp.Dependency;
using Abp.Reflection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace Shesha.DynamicEntities.TypeFinder
{
    public class ShaTypeFinder: IShaTypeFinder, ITransientDependency
    {
        private readonly ITypeFinder _abpTypeFinder;

        public ShaTypeFinder(
            ITypeFinder abpTypeFinder
        ) 
        {
            _abpTypeFinder = abpTypeFinder;
        }

        public List<Assembly> GetDynamicEntityAssemblies()
        {
            // ToDo: AlexS - use generic Dynamic namespaces
            return AppDomain.CurrentDomain.GetAssemblies()
                .Where(x => x.IsDynamic && (x.FullName?.Contains("ShaDynamic") ?? false))
                .ToList();
        }

        public Type[] Find(Func<Type, bool> predicate)
        {
            var types = _abpTypeFinder.Find(predicate).ToList();
            types.AddRange(GetDynamicEntityAssemblies().SelectMany(x => x.DefinedTypes).Where(predicate));

            return types.ToArray();
        }

        public Type[] FindAll()
        {
            var types = _abpTypeFinder.FindAll().ToList();
            types.AddRange(GetDynamicEntityAssemblies().SelectMany(x => x.DefinedTypes));

            return types.ToArray();
        }
    }
}
