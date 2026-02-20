using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using Shesha.Application.Services.Dto;
using Shesha.Authorization;
using Shesha.Domain;
using Shesha.Extensions;
using Shesha.Reflection;
using Shesha.ShaRoleAppointedPersons.Dto;
using Shesha.Validations;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.ShaRoleAppointedPersons
{
    [SheshaAuthorize(Shesha.Domain.Enums.RefListPermissionedAccess.RequiresPermissions, PermissionNames.Pages_Roles)]
    public class ShaRoleAppointedPersonActionsAppService : SheshaCrudServiceBase<ShaRoleAppointedPerson, ShaRoleAppointedPersonDto, Guid, FilteredPagedAndSortedResultRequestDto, CreateShaRoleAppointedPersonDto, ShaRoleAppointedPersonDto>, IShaRoleAppointedPersonAppService
    {
        private readonly IRepository<ShaRole, Guid> _roleRepository;
        private readonly IRepository<Person, Guid> _personRepository;
        private readonly IShaPermissionChecker _shaPermissionChecker;

        public ShaRoleAppointedPersonActionsAppService(IRepository<ShaRoleAppointedPerson, Guid> repository, IRepository<ShaRole, Guid> roleRepository, IRepository<Person, Guid> personRepository, IShaPermissionChecker shaPermissionChecker) : base(repository)
        {
            _roleRepository = roleRepository;
            _personRepository = personRepository;
            _shaPermissionChecker = shaPermissionChecker;
        }

        /// <summary>
        /// Creates new appointment
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        public override async Task<ShaRoleAppointedPersonDto> CreateAsync(CreateShaRoleAppointedPersonDto input)
        {
            CheckCreatePermission();

            var appointment = await BindAndValidateAsync(input);

            await CurrentUnitOfWork.SaveChangesAsync();

            if (appointment.Person?.User != null)
                await _shaPermissionChecker.ClearPermissionsCacheForUserAsync(appointment.Person.User.Id, appointment.Person.User.TenantId);

            var dto = MapToEntityDto(appointment);
            return dto;
        }

        private async Task<ShaRoleAppointedPerson> BindAndValidateAsync(IShaRoleAppointedPersonDto input)
        {
            var entity = input is EntityDto<Guid> withId && withId.Id != Guid.Empty
                ? await Repository.GetAsync(withId.Id)
                : new ShaRoleAppointedPerson();

            var role = input.RoleId != Guid.Empty
                ? await _roleRepository.GetAsync(input.RoleId)
                : null;
            var person = input.Person != null && input.Person.Id != null && input.Person.Id != Guid.Empty
                ? await _personRepository.GetAsync(input.Person.Id.Value)
                : null;

            var validationResults = new List<ValidationResult>();
            if (role == null)
                validationResults.Add(new ValidationResult("Role is mandatory"));
            if (person == null)
                validationResults.Add(new ValidationResult("Person is mandatory"));

            if (role != null && person != null &&
                await Repository.GetAll().AnyAsync(a => a.Role == role && a.Person == person && a.Id != entity.Id))
                validationResults.Add(new ValidationResult("Selected person already in the list"));

            validationResults.ThrowValidationExceptionIfAny(L);

            entity.Role = role.NotNull();
            entity.Person = person;

            await Repository.InsertOrUpdateAsync(entity);

            return entity;
        }

        public override async Task<ShaRoleAppointedPersonDto> UpdateAsync(ShaRoleAppointedPersonDto input)
        {
            CheckCreatePermission();

            var appointment = await BindAndValidateAsync(input);

            await CurrentUnitOfWork.SaveChangesAsync();

            if (appointment.Person?.User != null)
                await _shaPermissionChecker.ClearPermissionsCacheForUserAsync(appointment.Person.User.Id, appointment.Person.User.TenantId);

            var dto = MapToEntityDto(appointment);
            return dto;
        }

        public override async Task DeleteAsync(EntityDto<Guid> input)
        {
            CheckDeletePermission();

            var appointment = await Repository.GetAsync(input.Id);

            await Repository.DeleteAsync(appointment);

            await CurrentUnitOfWork.SaveChangesAsync();

            if (appointment?.Person?.User != null)
                await _shaPermissionChecker.ClearPermissionsCacheForUserAsync(appointment.Person.User.Id, appointment.Person.User.TenantId);
        }
    }
}

