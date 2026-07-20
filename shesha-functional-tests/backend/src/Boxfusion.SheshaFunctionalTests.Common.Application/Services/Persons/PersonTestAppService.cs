using Abp.Authorization;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Shesha;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities;
using Shesha.DynamicEntities.Dtos;
using Shesha.EntityReferences;
using Shesha.Extensions;

namespace Boxfusion.SheshaFunctionalTests.Common.Application.Services.Persons
{

    public class PersonTestDto //: DynamicDto<Person, Guid>
    {
        public virtual string? FirstName { get; set; }

        public virtual string? LastName { get; set; }

        public virtual string? MiddleName { get; set; }

        public virtual Guid? Address { get; set; }

        [EntityReferenceType(typeof(Organisation))]
        public EntityReferenceDto<Guid>? Organisation { get; set; }

        public string? OrganisationName { get; set; }

        public RefListGender? Gender { get; set; }
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

        public async Task<List<PersonTestDto>> GetPersonsAsync()
        {
            var pers = await (await Repository.GetAllAsync()).Where(x =>
                x.PrimaryOrganisation != null
                && x.Gender != null
                && x.PrimaryOrganisation.Parent == null
                && x.PrimaryOrganisation.PrimaryContact == null).Take(5).ToListAsync();

            return pers.Select(x => new PersonTestDto()
            {
                FirstName = x.FirstName,
                LastName = x.LastName,
                MiddleName = x.MiddleName,
                OrganisationName = x.PrimaryOrganisation.Name,
                Organisation = x.PrimaryOrganisation != null
                    ? new EntityReferenceDto<Guid>(x.PrimaryOrganisation)
                    : null,
                Gender = x.Gender
            }).ToList();
        }

        public override async Task<DynamicDto<Person, Guid>> UpdateAsync([DynamicBinder(UseDtoForEntityReferences = true, UseDynamicDtoProxy = true)] DynamicDto<Person, Guid> input)
        {
            return await base.UpdateAsync(input);
        }
    }
}