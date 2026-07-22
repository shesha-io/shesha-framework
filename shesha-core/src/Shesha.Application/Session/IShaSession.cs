using Abp.Runtime.Session;
using Shesha.Domain;
using System;
using System.Threading.Tasks;

namespace Shesha.Session
{
    /// <summary>
    /// Defines some session information that can be useful for Shesha applications.
    /// </summary>
    public interface IShaSession: IAbpSession
    {
        /// <summary>
        /// Current person
        /// </summary>
        Guid? PersonId { get; }

        /// <summary>
        /// Get current person
        /// </summary>
        /// <returns></returns>
        Task<Person> GetCurrentPersonAsync();

        /// <summary>
        /// Get current person or null
        /// </summary>
        /// <returns></returns>
        Task<Person?> GetCurrentPersonOrNullAsync();
    }
}
