using Abp.Dependency;
using Abp.Domain.Repositories;
using Shesha;
using Shesha.Domain;
using Shesha.DynamicEntities.Dtos;

namespace Boxfusion.SheshaFunctionalTests.Common.Application.Services
{
    public class OrganisationTestAppService : DynamicCrudAppService<Organisation, DynamicDto<Organisation, Guid>, Guid>, ITransientDependency
    {
        public OrganisationTestAppService(IRepository<Organisation, Guid> repository) : base(repository)
        {
        }
    }
}