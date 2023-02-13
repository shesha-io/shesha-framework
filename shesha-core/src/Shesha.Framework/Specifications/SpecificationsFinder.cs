using Abp.Dependency;
using Abp.Reflection;
using Shesha.Reflection;
using Shesha.Specifications.Exceptions;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Shesha.Specifications
{
    /// inheritedDoc
    public class SpecificationsFinder: ISpecificationsFinder, ISingletonDependency
    {
        private readonly ITypeFinder _typeFinder;
        private readonly List<ISpecificationInfo> _specifications;

        public SpecificationsFinder(ITypeFinder typeFinder)
        {
            _typeFinder = typeFinder;

            _specifications = _typeFinder.Find(t => t.IsSpecificationType())
                .SelectMany(t => SpecificationsHelper.GetSpecificationsInfo(t).Cast<ISpecificationInfo>())
                .ToList();
        }

        /// inheritedDoc
        public IEnumerable<ISpecificationInfo> GlobalSpecifications => _specifications.Where(s => s.IsGlobal);

        /// inheritedDoc
        public IEnumerable<ISpecificationInfo> AllSpecifications => _specifications;

        /// inheritedDoc
        public ISpecificationInfo FindSpecification(Type entityType, string name)
        {
            var specInfo = AllSpecifications.FirstOrDefault(s => s.Name == name && s.EntityType.IsAssignableFrom(entityType));
            if (specInfo == null)
                throw new SpecificationNotFoundException(entityType, name);
            
            return specInfo;
        }
    }
}
