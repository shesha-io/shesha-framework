using Abp.Dependency;
using Abp.Domain.Repositories;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Shesha;
using Shesha.Domain;
using Shesha.DynamicEntities;
using Shesha.DynamicEntities.Dtos;
using Shesha.Specifications;
using Shesha.Swagger;
using Swashbuckle.AspNetCore.Swagger;

namespace Boxfusion.SheshaFunctionalTests.Common.Application.Services
{
    public class OrganisationTestAppService : DynamicCrudAppService<Organisation, DynamicDto<Organisation, Guid>, Guid>, ITransientDependency
    {
        private IActionDescriptorChangeProvider _changeProvider;
        private ApplicationPartManager _applicationPartManager;
        private ISwaggerProvider _swaggerProvider;

        public OrganisationTestAppService(IRepository<Organisation, Guid> repository,
            IActionDescriptorChangeProvider changeProvider,
            ApplicationPartManager applicationPartManager,
            ISwaggerProvider swaggerProvider
            ) : base(repository)
        {
            _changeProvider = changeProvider;
            _applicationPartManager = applicationPartManager;
            _swaggerProvider = swaggerProvider;
        }

        public void Test()
        {
            /*var provider = (DynamicEntityControllerFeatureProvider)_applicationPartManager
                .FeatureProviders.Where(p => p is DynamicEntityControllerFeatureProvider).FirstOrDefault();

            provider.PopulateFeature(_applicationPartManager.ApplicationParts, )*/

            // Notify change
            SheshaActionDescriptorChangeProvider.Instance.HasChanged = true;
            SheshaActionDescriptorChangeProvider.Instance.TokenSource.Cancel();
            (_swaggerProvider as CachingSwaggerProvider)?.ClearCache();
        }

        [DisableSpecifications]
        public async Task GetUnfilteredAsync()
        {
            var persons = await AsyncQueryableExecuter.ToListAsync(Repository.GetAll());
        }

        public async Task GetDefaultFilteredAsync()
        {
            var persons = await AsyncQueryableExecuter.ToListAsync(Repository.GetAll());
        }

        //[ApplySpecifications(typeof(Age18PlusSpecification), typeof(HasNoAccountSpecification))]
        public async Task GetFilteredAsync()
        {
            var persons = await AsyncQueryableExecuter.ToListAsync(Repository.GetAll());
        }
    }

    public class OrganisationTest : Organisation
    {
        [CascadeUpdateRules(true, true)]
        public override Address PrimaryAddress { get => base.PrimaryAddress; set => base.PrimaryAddress = value; }
    }
}