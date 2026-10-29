namespace Shesha.Authorization.Abp.Users
{
    /// <summary>
    /// Used to store setting for a permission for a user.
    /// </summary>
    public class UserPermissionSetting : PermissionSetting
    {
        /// <summary>
        /// User id.
        /// </summary>
        public virtual long UserId { get; set; }
    }
}
