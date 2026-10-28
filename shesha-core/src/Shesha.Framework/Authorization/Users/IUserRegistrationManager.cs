using Abp.Domain.Services;
using System.Threading.Tasks;

namespace Shesha.Authorization.Users
{
    /// <summary>
    /// Interface for user registration management
    /// </summary>
    public interface IUserRegistrationManager : IDomainService
    {
        /// <summary>
        /// Registers a new user
        /// </summary>
        Task<User> RegisterAsync(string name, string? surname, string emailAddress, string userName, string plainPassword, bool isEmailConfirmed);
    }
}
