using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Shesha.Authorization;
using Shesha.ConfigurationItems;
using Shesha.Domain;
using Shesha.EntityReferences;
using Shesha.Extensions;
using Shesha.Reflection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Roles
{
    /// <summary>
    /// Role manager
    /// </summary>
    public class ShaRoleManager : ConfigurationItemManager<ShaRole>, IShaRoleManager, ITransientDependency
    {
        private readonly IRepository<ShaRole, Guid> _roleRepo;
        private readonly IRepository<ShaRoleAppointedPerson, Guid> _roleAppointedPersonRepo;
        private readonly IRepository<ShaRolePermission, Guid> _rolePermissionRepo;
        private readonly IShaPermissionChecker _shaPermissionChecker;
        private readonly IUnitOfWorkManager _unitOfWorkManager;

        public ShaRoleManager(
            IRepository<ShaRole, Guid> roleRepo,
            IRepository<ShaRoleAppointedPerson, Guid> roleAppointedPersonRepo,
            IRepository<ShaRolePermission, Guid> rolePermissionRepo,
            IShaPermissionChecker shaPermissionChecker,
            IUnitOfWorkManager unitOfWorkManager
        )
        {
            _roleRepo = roleRepo;
            _roleAppointedPersonRepo = roleAppointedPersonRepo;
            _rolePermissionRepo = rolePermissionRepo;
            _shaPermissionChecker = shaPermissionChecker;
            _unitOfWorkManager = unitOfWorkManager;
        }

        protected override async Task CopyItemPropertiesAsync(ShaRole source, ShaRole destination)
        {
            destination.NameSpace = source.NameSpace;
            destination.SetHardLinkToApplication(source.HardLinkToApplication);

            var permissions = await (await _rolePermissionRepo.GetAllAsync()).Where(p => p.Role == source).ToListAsync();
            foreach (var permission in permissions)
            {
                await _rolePermissionRepo.InsertAsync(new ShaRolePermission
                {
                    Role = destination,
                    Permission = permission.Permission,
                    IsGranted = permission.IsGranted,
                });
            }
        }

        private async Task<ShaRoleResult<ShaRoleAppointedPerson>> InternalAddToRoleAsync(Person person, ShaRole role, ShaRoleAppointmentData? appointmentData = null)
        {
            var result = new ShaRoleResult<ShaRoleAppointedPerson>();
            if (role == null) result.AddError("Role is mandatory");
            if (person == null) result.AddError("Person is mandatory");
            if (result.Succeeded == false) return result;

            // Check existing appointments
            var existAppointments = await (await _roleAppointedPersonRepo.GetAllAsync()).Where(a => a.Role == role && a.Person == person).ToListAsync();
            if (existAppointments.Any())
            {
                if (appointmentData?.PermissionedEntities?.Any() != true)
                {
                    // if no permissioned entities are passed, then check if the person is already in the role
                    // check if there is an appointment with no permissioned entities
                    var existAppointmentWithNoPermissionedEntities = existAppointments.FirstOrDefault(a => !a.PermissionedEntities.Any());
                    if (existAppointmentWithNoPermissionedEntities != null)
                        // return existing appointment
                        return result.AddError(existAppointmentWithNoPermissionedEntities, $"Person {person?.FullName} already in the Role {role?.Name}");
                }
                else
                {
                    // if permissioned entities are passed, then check if the person is already in the role with the same permissioned entities
                    foreach (var existAppointment in existAppointments)
                    {
                        var samePermissionedEntities = SamePermissionedEntities(existAppointment, appointmentData);
                        // check if there is an appointment with the same permissioned entities
                        if (samePermissionedEntities)
                            // return existing appointment
                            return result.AddError(existAppointment, $"Person {person?.FullName} already in the Role {role?.Name} with the same permissioned entities");
                    }
                }
            }

            var entity = new ShaRoleAppointedPerson() { Role = role.NotNull(), Person = person };
            var permissionedEntities = appointmentData?.PermissionedEntities.ToArray() ?? Array.Empty<GenericEntityReference>();
            if (permissionedEntities.Length > 0) entity.PermissionedEntity1 = permissionedEntities[0];
            if (permissionedEntities.Length > 1) entity.PermissionedEntity2 = permissionedEntities[1];
            if (permissionedEntities.Length > 2) entity.PermissionedEntity3 = permissionedEntities[2];

            await _roleAppointedPersonRepo.InsertOrUpdateAsync(entity);

            return result.AddAppointment(entity);
        }

        [UnitOfWork]
        public virtual async Task<ShaRoleResult<ShaRoleAppointedPerson>> AddToRoleAsync(Person person, ShaRole role, ShaRoleAppointmentData? appointmentData = null)
        {
            var result = await InternalAddToRoleAsync(person, role, appointmentData);
            if (!result.Succeeded) return result;
            await _unitOfWorkManager.Current.SaveChangesAsync();
            if (person.User != null)
                await _shaPermissionChecker.ClearPermissionsCacheForUserAsync(person.User.Id, person.User.TenantId);
            return result;
        }

        [UnitOfWork]
        public virtual async Task<ShaRoleResult<ShaRoleAppointedPerson>> AddToRolesAsync(Person person, IEnumerable<ShaRole> roles, ShaRoleAppointmentData? appointmentData = null)
        {
            var result = new ShaRoleResult<ShaRoleAppointedPerson>();
            if (person == null) return result.AddError("Person is mandatory");
            if (roles == null || !roles.Any()) return result.AddError("Roles are mandatory");
            if (result.Succeeded == false) return result;

            foreach (var role in roles)
            {
                var res = await InternalAddToRoleAsync(person, role, appointmentData);
                if (res.Succeeded == false) result.AddErrors(res.Errors);
            }

            await _unitOfWorkManager.Current.SaveChangesAsync();
            if (person.User != null)
                await _shaPermissionChecker.ClearPermissionsCacheForUserAsync(person.User.Id, person.User.TenantId);

            return result;
        }

        private static bool SamePermissionedEntities(ShaRoleAppointment a, ShaRoleAppointmentData data)
        {
            var requested = data.PermissionedEntities.Select(e => (e._className, e.Id)).ToHashSet();
            return a.PermissionedEntities.Select(e => (e._className, e.Id)).ToHashSet().SetEquals(requested);
        }

        public async Task<IList<ShaRoleAppointedPerson>> GetAppointmentsAsync(Person person, ShaRoleAppointmentData? appointmentData = null)
        {
            if (person == null) throw new ArgumentNullException(nameof(person));

            if (appointmentData == null)
                return await (await _roleAppointedPersonRepo.GetAllAsync()).Where(a => a.Person == person).ToListAsync();

            if (!appointmentData.PermissionedEntities.Any())
                return (await (await _roleAppointedPersonRepo.GetAllAsync()).Where(a => a.Person == person).ToListAsync())
                    .Where(a => !a.PermissionedEntities.Any()).ToList();

            var apps = await (await _roleAppointedPersonRepo.GetAllAsync()).Where(a => a.Person == person).ToListAsync();
            return apps.Where(a => SamePermissionedEntities(a, appointmentData)).ToList();
        }

        public async Task<IList<ShaRoleAppointedPerson>> GetAppointmentsAsync(ShaRole role, ShaRoleAppointmentData? appointmentData = null)
        {
            if (role == null) throw new ArgumentNullException(nameof(role));

            if (appointmentData == null)
                return await (await _roleAppointedPersonRepo.GetAllAsync()).Where(a => a.Role == role).ToListAsync();

            if (!appointmentData.PermissionedEntities.Any())
                return (await (await _roleAppointedPersonRepo.GetAllAsync()).Where(a => a.Role == role).ToListAsync())
                    .Where(a => !a.PermissionedEntities.Any()).ToList();

            var apps = await (await _roleAppointedPersonRepo.GetAllAsync()).Where(a => a.Role == role).ToListAsync();
            return apps.Where(a => SamePermissionedEntities(a, appointmentData)).ToList();
        }

        public async Task<IList<ShaRole>> GetRolesForPersonAsync(Person person, ShaRoleAppointmentData? appointmentData = null)
        {
            var appointments = await GetAppointmentsAsync(person, appointmentData);
            return appointments.Select(a => a.Role).Distinct().ToList();
        }

        public async Task<IList<Person?>> GetPersonsInRoleAsync(ShaRole role, ShaRoleAppointmentData? appointmentData = null)
        {
            var appointments = await GetAppointmentsAsync(role, appointmentData);
            return appointments.Select(a => a.Person).Distinct().ToList();
        }

        public async Task<bool> IsInRoleAsync(Person person, ShaRole role, ShaRoleAppointmentData? appointmentData = null)
        {
            var appointments = await GetAppointmentsAsync(person, appointmentData);
            return appointments.Any(a => a.Role == role);
        }

        private async Task<ShaRoleResult<ShaRoleAppointedPerson>> InternalRemoveFromRoleAsync(Person person, ShaRole role, ShaRoleAppointmentData? appointmentData = null)
        {
            var result = new ShaRoleResult<ShaRoleAppointedPerson>();
            if (person == null) return result.AddError("Person is mandatory");
            if (role == null) return result.AddError("Roles are mandatory");
            if (result.Succeeded == false) return result;

            var appointments = (await GetAppointmentsAsync(person, appointmentData)).Where(a => a.Role == role).ToList();
            foreach (var appointment in appointments)
            {
                await _roleAppointedPersonRepo.DeleteAsync(appointment.Id);
            }

            return new ShaRoleResult<ShaRoleAppointedPerson>();
        }

        [UnitOfWork]

        public virtual async Task<ShaRoleResult<ShaRoleAppointedPerson>> RemoveFromRoleAsync(Person person, ShaRole role, ShaRoleAppointmentData? appointmentData = null)
        {
            var result = await InternalRemoveFromRoleAsync(person, role, appointmentData);
            if (!result.Succeeded) return result;
            await _unitOfWorkManager.Current.SaveChangesAsync();
            if (person.User != null)
                await _shaPermissionChecker.ClearPermissionsCacheForUserAsync(person.User.Id, person.User.TenantId);
            return result;
        }

        [UnitOfWork]
        public virtual async Task<ShaRoleResult<ShaRoleAppointedPerson>> RemoveFromRolesAsync(Person person, IEnumerable<ShaRole> roles, ShaRoleAppointmentData? appointmentData = null)
        {
            var result = new ShaRoleResult<ShaRoleAppointedPerson>();
            if (person == null) return result.AddError("Person is mandatory");
            if (roles == null || !roles.Any()) return result.AddError("Roles are mandatory");
            if (result.Succeeded == false) return result;

            foreach (var role in roles)
            {
                result = await InternalRemoveFromRoleAsync(person, role, appointmentData);
                if (result.Succeeded == false) break;
            }

            await _unitOfWorkManager.Current.SaveChangesAsync();
            if (person.User != null)
                await _shaPermissionChecker.ClearPermissionsCacheForUserAsync(person.User.Id, person.User.TenantId);

            return result;
        }

        [UnitOfWork]
        public virtual async Task<ShaRoleResult<ShaRoleAppointedPerson>> DeleteAppointmentAsync(ShaRoleAppointedPerson appointment)
        {
            var result = new ShaRoleResult<ShaRoleAppointedPerson>();
            if (appointment == null) return result.AddError("Appointment is mandatory");
            var person = appointment.Person;
            await _roleAppointedPersonRepo.DeleteAsync(appointment.Id);
            await _unitOfWorkManager.Current.SaveChangesAsync();
            if (person?.User != null)
                await _shaPermissionChecker.ClearPermissionsCacheForUserAsync(person.User.Id, person.User.TenantId);
            return result;
        }

        public async Task<ShaRoleResult<ShaRoleAppointedPerson>> SetRolesAsync(Person person, IEnumerable<ShaRole> roles, ShaRoleAppointmentData? appointmentData = null)
        {
            var result = new ShaRoleResult<ShaRoleAppointedPerson>();
            if (person == null) return result.AddError("Person is mandatory");
            if (roles == null || !roles.Any()) return result.AddError("Roles are mandatory");
            if (result.Succeeded == false) return result;

            var rolesInDb = (await GetRolesForPersonAsync(person, appointmentData));

            foreach (var role in roles)
            {
                if (!rolesInDb.Contains(role))
                {
                    var res = await AddToRoleAsync(person, role, appointmentData);
                    if (res.Succeeded == false) result.AddErrors(res.Errors);
                }
            }

            foreach (var roleInDb in rolesInDb)
            {
                if (!roles.Contains(roleInDb))
                {
                    var res = await RemoveFromRoleAsync(person, roleInDb, appointmentData);
                    if (res.Succeeded == false) result.AddErrors(res.Errors);
                }
            }

            return result;
        }
    }
}
