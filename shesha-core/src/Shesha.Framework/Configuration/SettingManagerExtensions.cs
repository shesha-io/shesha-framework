using Abp.Configuration;
using System.Threading.Tasks;
using Abp.Dependency;
using Abp.Runtime.Session;
using Shesha.Services;

namespace Shesha.Configuration
{
    /// <summary>
    /// Extensions of the <see cref="ISettingManager"/>
    /// </summary>
    public static class SettingManagerExtensions
    {
        /// <summary>
        /// Changes setting for tenant with fallback to application
        /// </summary>
        /// <param name="name">Setting name</param>
        /// <param name="value">Setting value</param>
        public static async Task ChangeSettingAsync(this ISettingManager manager, string name, string value)
        {
            var session = StaticContext.IocManager.Resolve<IAbpSession>();
            if (session.TenantId.HasValue)
            {
                await manager.ChangeSettingForTenantAsync(session.TenantId.Value, name, value);
            }
            else
            {
                await manager.ChangeSettingForApplicationAsync(name, value);
            }
        }

        /// <summary>
        /// Changes setting for tenant with fallback to application
        /// </summary>
        /// <param name="name">Setting name</param>
        /// <param name="value">Setting value</param>
        public static void ChangeSetting(this ISettingManager manager, string name, string value)
        {
            var session = StaticContext.IocManager.Resolve<IAbpSession>();
            if (session.TenantId.HasValue)
            {
                manager.ChangeSettingForTenant(session.TenantId.Value, name, value);
            }
            else
            {
                manager.ChangeSettingForApplication(name, value);
            }
        }
    }
}
