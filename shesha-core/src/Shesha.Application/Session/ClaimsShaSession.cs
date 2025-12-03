using Abp.Configuration.Startup;
using Abp.Domain.Repositories;
using Abp.MultiTenancy;
using Abp.Runtime;
using Abp.Runtime.Session;
using Shesha.Domain;
using Shesha.Extensions;
using Shesha.Utilities;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Session
{
    /// <summary>
    /// Implements <see cref="IShaSession"/> to get session properties from current claims.
    /// </summary>
    public class ClaimsShaSession : ClaimsAbpSession, IShaSession
    {
        protected IRepository<Person, Guid> PersonRepository;

        public ClaimsShaSession(IPrincipalAccessor principalAccessor, 
            IMultiTenancyConfig multiTenancy, 
            ITenantResolver tenantResolver, 
            IAmbientScopeProvider<SessionOverride> sessionOverrideScopeProvider,
            IRepository<Person, Guid> personRepository) : base(principalAccessor, multiTenancy, tenantResolver, sessionOverrideScopeProvider)
        {
            PersonRepository = personRepository;
        }

        public virtual Guid? PersonId 
        {
            get
            {
                var personIdClaim = PrincipalAccessor.Principal?.Claims.FirstOrDefault(c => c.Type == ShaClaimTypes.PersonId);
                return !string.IsNullOrWhiteSpace(personIdClaim?.Value)
                    ? personIdClaim.Value.ToGuidOrNull()
                    : null;
            }
        }

        public Task<Person> GetCurrentPersonAsync()
        {
            return PersonRepository.GetAll().FirstOrDefaultAsync(p => p.User != null && p.User.Id == this.GetUserId());
        }
    }
}
