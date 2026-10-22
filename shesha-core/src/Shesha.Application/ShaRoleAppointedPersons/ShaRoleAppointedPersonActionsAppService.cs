using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using Abp.UI;
using Shesha.Authorization;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;
using Shesha.EntityReferences;
using Shesha.Roles;
using Shesha.ShaRoleAppointedPersons.Dto;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.ShaRoleAppointedPersons
{
    [SheshaAuthorize(Shesha.Domain.Enums.RefListPermissionedAccess.RequiresPermissions, PermissionNames.Role_Manage, IsConfigurable = false)]
    public class ShaRoleAppointedPersonActionsAppService : SheshaAppServiceBase
    {
        private readonly IRepository<ShaRole, Guid> _roleRepository;
        private readonly IRepository<Person, Guid> _personRepository;
        private readonly IRepository<ShaRoleAppointedPerson, Guid> _appointmentRepository;
        private readonly IShaRoleManager _shaRoleManager;

        public ShaRoleAppointedPersonActionsAppService(
            IRepository<ShaRole, Guid> roleRepository,
            IRepository<Person, Guid> personRepository,
            IRepository<ShaRoleAppointedPerson, Guid> appointmentRepository,
            IShaRoleManager shaRoleManager,
            IShaPermissionChecker shaPermissionChecker
        )
        {
            _roleRepository = roleRepository;
            _appointmentRepository = appointmentRepository;
            _personRepository = personRepository;
            _shaRoleManager = shaRoleManager;
        }

        /// <summary>
        /// Creates new appointment (Add person to role)
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        public async Task<ShaRoleAppointedPersonDto> AddToRoleAsync(CreateShaRoleAppointedPersonDto input)
        {
            var role = input.RoleId != Guid.Empty ? await _roleRepository.GetAsync(input.RoleId) : null;
            var person = input.PersonId != Guid.Empty ? await _personRepository.GetAsync(input.PersonId) : null;

            if (role == null) throw new UserFriendlyException("Role not found");
            if (person == null) throw new UserFriendlyException("Person not found");
            if (input.PermissionedEntities?.Count() > 3) throw new UserFriendlyException("You can add up to 3 permissioned entities");

            ShaRoleAppointmentData data = null;

            if (input.PermissionedEntities != null)
            {
                data = new ShaRoleAppointmentData();
                foreach (var entity in input.PermissionedEntities)
                    data.PermissionedEntities.Add(new GenericEntityReference(entity.Id.ToString(), entity._className, entity._displayName));
            }

            var result = await _shaRoleManager.AddToRoleAsync(person, role, data);

            if (!result.Succeeded)
                throw new UserFriendlyException(String.Join("; ", result.Errors));

            var dto = ObjectMapper.Map<ShaRoleAppointedPersonDto>(result.ShaRoleAppointment);
            return dto;
        }

        public async Task DeleteAsync(EntityDto<Guid> input)
        {
            var appointment = await _appointmentRepository.GetAsync(input.Id);
            await _shaRoleManager.DeleteAppointmentAsync(appointment);
        }

        private ShaRoleAppointedPersonDto Map(ShaRoleAppointedPerson entity)
        {
            return new ShaRoleAppointedPersonDto()
            {
                RoleId = entity.Role?.Id ?? Guid.Empty,
                PersonId = entity.Person?.Id ?? Guid.Empty,
                PermissionedEntities = entity.PermissionedEntities?.Select(e => new EntityReferenceDto<string>(e.Id, e._displayName, e._className)).ToList()
            };
        }
    }
}

