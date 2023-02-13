using Abp.Authorization;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Shesha.Domain;
using Shesha.DynamicEntities;
using Shesha.DynamicEntities.Dtos;
using Shesha.Specifications;
using System;
using System.Threading.Tasks;

namespace Shesha.Application.Persons
{
    [AbpAuthorize]
    public class PersonTestAppService : DynamicCrudAppService<Person, DynamicDto<Person, Guid>, Guid>, ITransientDependency
    {
        public PersonTestAppService(IRepository<Person, Guid> repository) : base(repository)
        {
        }

        public override async Task<DynamicDto<Person, Guid>> UpdateAsync([DynamicBinder(UseDtoForEntityReferences = true, UseDynamicDtoProxy = true)] DynamicDto<Person, Guid> input) 
        { 
            return await base.UpdateAsync(input);
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

        [ApplySpecifications(typeof(Age18PlusSpecification), typeof(HasNoAccountSpecification))]
        public async Task GetFilteredAsync()
        {
            var persons = await AsyncQueryableExecuter.ToListAsync(Repository.GetAll());
        }
    }
}