using Abp.Dependency;
using Abp.Reflection;
using Abp.Runtime.Caching;
using Shesha.Attributes;
using Shesha.Domain;
using Shesha.Extensions;
using Shesha.JsonEntities;
using Shesha.Metadata.Dtos;
using Shesha.Reflection;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace Shesha.Metadata
{
    public class AttributeModelProvider : BaseModelProvider, ITransientDependency
    {
        private readonly IAssemblyFinder _assembleFinder;

        public AttributeModelProvider(ICacheManager cacheManager, IAssemblyFinder assembleFinder) : base(cacheManager)
        {
            _assembleFinder = assembleFinder;
        }

        protected override Task<List<ModelDto>> FetchModelsAsync()
        {
            var types = _assembleFinder.GetAllAssemblies()
                .Distinct(new AssemblyFullNameComparer())
                .SelectMany(a => a.GetTypes())
                .Where(t =>
                    t.GetAttribute<AddToMetadataAttribute>() != null &&
                    // skip entity types, they shouldn't be returned by the application service at all
                    !t.IsEntityType()
                ).ToList();

            var dtos = types.Select(p => new ModelDto
            {
                ClassName = p.FullName,
                Type = p,
                Description = ReflectionHelper.GetDescription(p),
                Alias = null
            }).ToList();

            return Task.FromResult(dtos);
        }
    }
}
