using Shesha.Domain;

namespace Shesha.Settings
{
    /// <summary>
    /// Setting management context, is used to explicitly pass some arguments using reading/writing of settings
    /// </summary>
    public class SettingManagementContext
    {
        /// <summary>
        /// AppKey of the front-end application (<see cref="FrontEndApp.AppKey"/>)
        /// </summary>
        public string AppKey { get; set; }

        /// <summary>
        /// Tenant Id
        /// </summary>
        public int? TenantId { get; set; }

        /// <summary>
        /// User Id
        /// </summary>
        public long? UserId { get; set; }
    }
}
