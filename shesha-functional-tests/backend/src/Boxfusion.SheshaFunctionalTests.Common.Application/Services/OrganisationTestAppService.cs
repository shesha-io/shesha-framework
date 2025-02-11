using Abp.Dependency;
using Abp.Domain.Repositories;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Shesha;
using Shesha.Domain;
using Shesha.DynamicEntities.Dtos;
using Shesha.Specifications;
using Swashbuckle.AspNetCore.Swagger;

namespace Boxfusion.SheshaFunctionalTests.Common.Application.Services
{
    public class OrganisationTestAppService : DynamicCrudAppService<Organisation, DynamicDto<Organisation, Guid>, Guid>, ITransientDependency
    {
        //private IActionDescriptorChangeProvider _changeProvider;
        private ApplicationPartManager _applicationPartManager;
        private ISwaggerProvider _swaggerProvider;
        //private IRepository<OrganisationTestDirectPersons, Guid> _organisationTestDirectPersons;

        public OrganisationTestAppService(IRepository<Organisation, Guid> repository,
            //IActionDescriptorChangeProvider changeProvider,
            ApplicationPartManager applicationPartManager,
            ISwaggerProvider swaggerProvider/*,
            IRepository<OrganisationTestDirectPersons, Guid> organisationTestDirectPersons*/
            ) : base(repository)
        {
            //_changeProvider = changeProvider;
            _applicationPartManager = applicationPartManager;
            _swaggerProvider = swaggerProvider;
            //_organisationTestDirectPersons = organisationTestDirectPersons;
        }

        public void Test()
        {
            /*var l = _organisationTestDirectPersons.GetAllList();

            var o = new OrganisationTestDirectPersons()
            {
                OrganisationTestId = Guid.Parse("23BA4023-ACAB-479F-AE5D-C4EAA11BB36A"),
                PersonId = Guid.Parse("F0DC2667-2DD5-4DB7-B23D-00C40431DE6B")//,
                //Test = "Manual"
            };

            _organisationTestDirectPersons.Insert(o);*/
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
}