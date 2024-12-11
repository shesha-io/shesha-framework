using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using Abp.Runtime.Validation;
using Shesha.Application.Services.Dto;
using Shesha.Authorization;
using Shesha.Domain;
using Shesha.Extensions;
using Shesha.ShaRoleAppointedPersons.Dto;
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
        private readonly IRepository<ShaRoleAppointmentEntity, Guid> _appEntityRepository;
        private readonly IRepository<Person, Guid> _personRepository;
        private readonly IRepository<Area, Guid> _areaRepository;
        private readonly IShaPermissionChecker _shaPermissionChecker;

        public ShaRoleAppointedPersonActionsAppService(IRepository<ShaRoleAppointedPerson, Guid> repository, IRepository<ShaRole, Guid> roleRepository, IRepository<ShaRoleAppointmentEntity, Guid> appEntityRepository, IRepository<Person, Guid> personRepository, IRepository<Area, Guid> areaRepository, IShaPermissionChecker shaPermissionChecker) : base(repository)
        {
            _roleRepository = roleRepository;
            _appEntityRepository = appEntityRepository;
            _personRepository = personRepository;
            _areaRepository = areaRepository;
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

            var appointment = await BindAndValidate(input);

            await CurrentUnitOfWork.SaveChangesAsync();

            if (appointment?.Person?.User != null)
                await _shaPermissionChecker.ClearPermissionsCacheForUserAsync(appointment.Person.User.Id, appointment.Person.User.TenantId);

            var dto = MapToEntityDto(appointment);
            return dto;
        }

        private async Task<ShaRoleAppointedPerson> BindAndValidate(IShaRoleAppointedPersonDto input)
        {
            var entity = input is EntityDto<Guid> withId && withId.Id != Guid.Empty
                ? await Repository.GetAsync(withId.Id)
                : new ShaRoleAppointedPerson();

            entity.Role = input.RoleId != Guid.Empty
                ? await _roleRepository.GetAsync(input.RoleId)
                : null;
            entity.Person = (input.Person?.Id ?? Guid.Empty) != Guid.Empty
                ? await _personRepository.GetAsync(input.Person.Id.Value)
                : null;

            var regionIds = input.Regions.Select(r => r.Id).ToList();
            var regions = input.Regions.Any()
                ? await _areaRepository.GetAll().Where(a => regionIds.Contains(a.Id)).ToListAsync()
                : new List<Area>();

            var validationResults = new List<ValidationResult>();
            if (entity.Role == null)
                validationResults.Add(new ValidationResult("Role is mandatory"));
            if (entity.Person == null)
                validationResults.Add(new ValidationResult("Person is mandatory"));

            if (entity.Role != null && entity.Person != null &&
                await Repository.GetAll().AnyAsync(a => a.Role == entity.Role && a.Person == entity.Person && a.Id != entity.Id))
                validationResults.Add(new ValidationResult("Selected person already in the list"));

            // todo: validate regions only for roles with region parameter

            if (validationResults.Any())
                throw new AbpValidationException("Please correct the errors and try again", validationResults);

            await Repository.InsertOrUpdateAsync(entity);

            var regionTypeShortAlias = typeof(Area).GetEntityConfiguration().TypeShortAlias;
            var linkedRegions = await _appEntityRepository.GetAll().Where(e => e.Appointment == entity && e.EntityTypeAlias == regionTypeShortAlias).ToListAsync();
            
            // delete removed ones
            var linkedRegionsToDelete = linkedRegions.Where(e => e.EntityTypeAlias == regionTypeShortAlias && !regions.Any(r => r.Id.ToString() == e.EntityId)).ToList();
            foreach (var linkedRegion in linkedRegionsToDelete)
            {
                await _appEntityRepository.DeleteAsync(linkedRegion);
            }

            // add new ones
            var toAdd = regions.Where(r => !linkedRegions.Any(e => e.EntityTypeAlias == regionTypeShortAlias && e.EntityId == r.Id.ToString())).ToList();
            foreach (var region in toAdd)
            {
                await _appEntityRepository.InsertAsync(new ShaRoleAppointmentEntity
                {
                    Appointment = entity,
                    EntityId = region.Id.ToString(),
                    EntityTypeAlias = regionTypeShortAlias
                });
            }

            return entity;
        }

        public override async Task<ShaRoleAppointedPersonDto> UpdateAsync(ShaRoleAppointedPersonDto input)
        {
            CheckCreatePermission();

            var appointment = await BindAndValidate(input);

            await CurrentUnitOfWork.SaveChangesAsync();

            if (appointment?.Person?.User != null)
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

