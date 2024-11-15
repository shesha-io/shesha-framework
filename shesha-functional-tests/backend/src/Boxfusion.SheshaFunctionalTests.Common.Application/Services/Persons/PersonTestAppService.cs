using Abp.Auditing;
using Abp.Authorization;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Shesha;
using Shesha.Domain;
using Shesha.DynamicEntities;
using Shesha.DynamicEntities.Dtos;
using Shesha.Specifications;
using System.ComponentModel.DataAnnotations;

namespace Boxfusion.SheshaFunctionalTests.Common.Application.Services.Persons
{

    public class PersonTestDto : DynamicDto<Person, Guid>
    {
        public virtual string FirstName { get; set; }

        public virtual string LastName { get; set; }

        public virtual string MiddleName { get; set; }

        public virtual Guid Address { get; set; }
    }


    [AbpAuthorize]
    public class PersonTestAppService : DynamicCrudAppService<Person, DynamicDto<Person, Guid>, Guid>, ITransientDependency
    {
        public PersonTestAppService(IRepository<Person, Guid> repository) : base(repository)
        {
        }

        public void Test(DynamicDto<Person, Guid> input)
        {
        }

        public void TestDto([DynamicBinder(UseDtoForEntityReferences = true, UseDynamicDtoProxy = true)] DynamicDto<Person, Guid> input)
        {
        }

        public async Task TestPersonAsync(PersonTestDto input)
        {
            var p = new Person();
            await MapDynamicDtoToEntityAsync<PersonTestDto, Person, Guid>(input, p);
            var pp = new Person();
            var v = new List<ValidationResult>();
            await MapJObjectToEntityAsync<Person, Guid>(input._jObject, pp, v);
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

        //[ApplySpecifications(typeof(Age18PlusSpecification), typeof(HasNoAccountSpecification))]
        public async Task GetFilteredAsync()
        {
            var persons = await AsyncQueryableExecuter.ToListAsync(Repository.GetAll());
        }
    }
}