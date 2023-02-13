using Abp.Authorization.Users;

namespace Shesha.Authorization
{
    /// <summary>
    /// Is used to allow/disallow the user to login using email
    /// </summary>
    public interface IEmailLoginFilter<TUser> where TUser : AbpUser<TUser>
    {
        /// <summary>
        /// Returns true if the user is able to login using email address instead of username
        /// </summary>
        bool AllowToLoginUsingEmail(string email, TUser user);
    }
}
