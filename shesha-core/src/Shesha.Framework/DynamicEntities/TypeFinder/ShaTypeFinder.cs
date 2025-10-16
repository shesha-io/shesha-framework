using Abp.Dependency;
using Abp.Reflection;
using Shesha.DynamicEntities.EntityTypeBuilder;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace Shesha.DynamicEntities.TypeFinder
{
    public class ShaTypeFinder : IShaTypeFinder, ITransientDependency
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
            // ToDo: AS - V1 use generic Dynamic namespaces
            return AppDomain.CurrentDomain.GetAssemblies()
                .Where(x => x.IsDynamic && (x.FullName?.Contains(DynamicEntityTypeBuilder.SheshaDynamicNamespace) ?? false))
                .GroupBy(x => x.GetName().Name ?? "")
                .Select(x =>
                    x.OrderBy(a => a.GetName().Version?.Major)
                        .ThenBy(a => a.GetName().Version?.Minor)
                        .ThenBy(a => a.GetName().Version?.Build)
                        .ThenBy(a => a.GetName().Version?.Revision)
                    .Last())
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
