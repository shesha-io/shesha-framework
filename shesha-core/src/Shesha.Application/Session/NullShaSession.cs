using Abp.MultiTenancy;
using Abp.Runtime.Remoting;
using Abp.Runtime.Session;
using Shesha.Domain;
using System;
using System.Threading.Tasks;

namespace Shesha.Session
{
#nullable enable
    /// <summary>
    /// Implements null object pattern for <see cref="IShaSession"/>.
    /// </summary>
    public class NullShaSession : AbpSessionBase, IShaSession
    {
        /// <summary>
        /// Singleton instance.
        /// </summary>
        public static NullShaSession Instance { get; } = new NullShaSession();

        /// <inheritdoc/>
        public override long? UserId => null;

        /// <inheritdoc/>
        public override int? TenantId => null;

        public override MultiTenancySides MultiTenancySide => MultiTenancySides.Tenant;

        public override long? ImpersonatorUserId => null;

        public override int? ImpersonatorTenantId => null;

        public Guid? PersonId => null;

        private NullShaSession()
            : base(
                  new NullMultiTenancyConfig(),
                  new DataContextAmbientScopeProvider<SessionOverride>(new AsyncLocalAmbientDataContext())
            )
        {

        }

        public Task<Person> GetCurrentPersonAsync()
        {
            throw new NotImplementedException();
        }

        public Task<Person?> GetCurrentPersonOrNullAsync()
        {
            throw new NotImplementedException();
        }
    }
#nullable restore
}
