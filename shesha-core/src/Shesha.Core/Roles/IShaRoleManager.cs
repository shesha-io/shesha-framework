using Shesha.Domain;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.Roles
{
    public interface IShaRoleManager
    {
        // Assignment

        /// <summary>
        /// Assigns person to the role
        /// </summary>
        /// <param name="person">Person</param>
        /// <param name="role">Role</param>
        /// <param name="appointmentData">Additional data</param>
        /// <returns>ShaRoleResult with added appointment or errors</returns>
        Task<ShaRoleResult<ShaRoleAppointedPerson>> AddToRoleAsync(Person person, ShaRole role, ShaRoleAppointmentData appointmentData = null);
        /// <summary>
        /// Assigns person to the role
        /// </summary>
        /// <param name="person">Person</param>
        /// <param name="roles">List of Roles</param>
        /// <param name="appointmentData">Additional data</param>
        /// <returns>ShaRoleResult with added appointment or errors</returns>
        Task<ShaRoleResult<ShaRoleAppointedPerson>> AddToRolesAsync(Person person, IEnumerable<ShaRole> roles, ShaRoleAppointmentData appointmentData = null);

        // Removal

        /// <summary>
        /// Removes person from the role
        /// </summary>
        /// <param name="person">Person</param>
        /// <param name="role">Role</param>
        /// <param name="appointmentData">
        /// Additional data
        /// 1. null - will be removed all appointments
        /// 2. empty list - will be removed all appointments without permissioned entities
        /// 3. list of permissioned entities - will be removed all appointments with the same permissioned entities
        /// </param>
        /// <returns>ShaRoleResult with errors</returns>
        Task<ShaRoleResult<ShaRoleAppointedPerson>> RemoveFromRoleAsync(Person person, ShaRole role, ShaRoleAppointmentData appointmentData = null);
        /// <summary>
        /// Removes person from the role
        /// </summary>
        /// <param name="person">Person</param>
        /// <param name="roles">Roles</param>
        /// <param name="appointmentData">
        /// Additional data
        /// 1. null - will be removed all appointments
        /// 2. empty list - will be removed all appointments without permissioned entities
        /// 3. list of permissioned entities - will be removed all appointments with the same permissioned entities
        /// </param>
        /// <returns>ShaRoleResult with errors</returns>
        Task<ShaRoleResult<ShaRoleAppointedPerson>> RemoveFromRolesAsync(Person person, IEnumerable<ShaRole> roles, ShaRoleAppointmentData appointmentData = null);

        /// <summary>
        /// Removes appointment
        /// </summary>
        /// <param name="appointment"></param>
        /// <returns>ShaRoleResult with errors</returns>
        Task<ShaRoleResult<ShaRoleAppointedPerson>> DeleteAppointmentAsync(ShaRoleAppointedPerson appointment);

        // Sync: add missing roles and remove roles not in the list

        /// <summary>
        /// Add missing roles and remove roles not in the list
        /// </summary>
        /// <param name="person">Person</param>
        /// <param name="roles">List of Roles</param>
        /// <param name="appointmentData">Additional data</param>
        /// <returns>ShaRoleResult with added appointment or errors</returns>
        Task<ShaRoleResult<ShaRoleAppointedPerson>> SetRolesAsync(Person person, IEnumerable<ShaRole> roles, ShaRoleAppointmentData appointmentData = null);

        // Queries (active appointments only)

        /// <summary>
        /// Check if person is in the role
        /// </summary>
        /// <param name="person">Person</param>
        /// <param name="role">Role</param>
        /// <param name="appointmentData">
        /// Additional data
        /// 1. null - will be checked all appointments
        /// 2. empty list - will be checked all appointments without permissioned entities
        /// 3. list of permissioned entities - will be checked all appointments with the same permissioned entities
        /// </param>
        /// <returns></returns>
        Task<bool> IsInRoleAsync(Person person, ShaRole role, ShaRoleAppointmentData appointmentData = null);
        /// <summary>
        /// Get roles for person
        /// </summary>
        /// <param name="person">Person</param>
        /// <param name="appointmentData">
        /// Additional data
        /// 1. null - will be checked all appointments
        /// 2. empty list - will be checked all appointments without permissioned entities
        /// 3. list of permissioned entities - will be checked all appointments with the same permissioned entities
        /// </param>
        /// <returns></returns>
        Task<IList<ShaRole>> GetRolesForPersonAsync(Person person, ShaRoleAppointmentData appointmentData = null);
        /// <summary>
        /// Get persons in the role
        /// </summary>
        /// <param name="role">Role</param>
        /// <param name="appointmentData">
        /// Additional data
        /// 1. null - will be checked all appointments
        /// 2. empty list - will be checked all appointments without permissioned entities
        /// 3. list of permissioned entities - will be checked all appointments with the same permissioned entities
        /// </param>
        /// <returns></returns>
        Task<IList<Person>> GetPersonsInRoleAsync(ShaRole role, ShaRoleAppointmentData appointmentData = null);
        /// <summary>
        /// Get appointments for the person
        /// </summary>
        /// <param name="person">Person</param>
        /// <param name="appointmentData">
        /// Additional data
        /// 1. null - will be checked all appointments
        /// 2. empty list - will be checked all appointments without permissioned entities
        /// 3. list of permissioned entities - will be checked all appointments with the same permissioned entities
        /// </param>
        /// <returns></returns>
        Task<IList<ShaRoleAppointedPerson>> GetAppointmentsAsync(Person person, ShaRoleAppointmentData appointmentData = null);
        /// <summary>
        /// Get appointments in the role
        /// </summary>
        /// <param name="role">Role</param>
        /// <param name="appointmentData">
        /// Additional data
        /// 1. null - will be checked all appointments
        /// 2. empty list - will be checked all appointments without permissioned entities
        /// 3. list of permissioned entities - will be checked all appointments with the same permissioned entities
        /// </param>
        /// <returns></returns>
        Task<IList<ShaRoleAppointedPerson>> GetAppointmentsAsync(ShaRole role, ShaRoleAppointmentData appointmentData = null);
    }
}
