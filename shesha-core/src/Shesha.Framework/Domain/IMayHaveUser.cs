using Shesha.Authorization.Users;

namespace Shesha.Domain
{
    /// <summary>
    /// Setting value
    /// </summary>
    public interface IMayHaveUser
    {
        User? User { get; set; }
    }
}
