using Abp.Dependency;
using Abp.Reflection;
using Abp.Runtime.Caching;
using Shesha.Attributes;
using Shesha.Extensions;
using Shesha.Metadata.Dtos;
using Shesha.Reflection;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Metadata
{
    public class AttributeModelProvider : BaseModelProvider, ISingletonDependency
    {
        private readonly IAssemblyFinder _assembleFinder;

        public AttributeModelProvider(ICacheManager cacheManager, IAssemblyFinder assembleFinder) : base("AttributeModelProviderCache", cacheManager)
        {
            _assembleFinder = assembleFinder;
        }

        protected override Task<List<ModelDto>> FetchModelsAsync()
        {
            var types = _assembleFinder.GetAllAssemblies()
                .Distinct(new AssemblyFullNameComparer())
                .SelectMany(a => a.GetTypes())
                .Where(t =>
                    t.GetAttributeOrNull<AddToMetadataAttribute>() != null &&
                    // skip entity types, they shouldn't be returned by the application service at all
                    !t.IsEntityType()
                ).ToList();

            var dtos = types.Select(p => new ModelDto
            {
                Name = p.Name,
                ClassName = p.GetRequiredFullName(),
                Type = p,
                Description = ReflectionHelper.GetDescription(p),
                Alias = null
            }).ToList();

            return Task.FromResult(dtos);
        }
    }
}
