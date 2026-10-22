using Shesha.Domain;
using System.Collections.Generic;

namespace Shesha.Roles
{
    public class ShaRoleResult<TAppointment>
    {
        public TAppointment ShaRoleAppointment { get; protected set; }

        /// <summary>
        /// Flag indicating whether if the operation succeeded or not.
        /// </summary>
        /// <value>True if the operation succeeded, otherwise false.</value>
        public bool Succeeded { get; protected set; }

        public List<string> Errors { get; protected set; } = new List<string>();

        public ShaRoleResult()
        {
            Succeeded = true;
        }

        public ShaRoleResult<TAppointment> AddError(string error)
        {
            Succeeded = false;
            Errors.Add(error);
            return this;
        }

        public ShaRoleResult<TAppointment> AddError(TAppointment appointment, string error)
        {
            Succeeded = false;
            ShaRoleAppointment = appointment;
            Errors.Add(error);
            return this;
        }

        public ShaRoleResult<TAppointment> AddErrors(IEnumerable<string> errors)
        {
            Succeeded = false;
            Errors.AddRange(errors);
            return this;
        }

        public ShaRoleResult<TAppointment> AddAppointment(TAppointment appointment)
        {
            Succeeded = true;
            ShaRoleAppointment = appointment;
            return this;
        }
    }
}
