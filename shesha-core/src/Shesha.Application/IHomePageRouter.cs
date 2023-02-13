using Shesha.Authorization.Users;
using System.Threading.Tasks;

namespace Shesha
{
    /// <summary>
    /// Interface for a class used to determine which page a user should be directed
    /// to by default straight after successfully loging in.
    /// </summary>
    public interface IHomePageRouter
    {

        Task<string> GetHomePageUrlAsync(User user);
    }
}
