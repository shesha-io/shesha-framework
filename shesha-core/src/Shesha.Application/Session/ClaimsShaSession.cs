using Abp;
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
#nullable enable
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

        public async Task<Person> GetCurrentPersonAsync()
        {
            var person = await GetCurrentPersonOrNullAsync();
            if (person == null)
                throw new AbpException("Session.UserId is null! Probably, user is not logged in.");

            return person;
        }

        public async Task<Person?> GetCurrentPersonOrNullAsync()
        {
            return UserId != null
                ? await PersonRepository.GetAll().FirstOrDefaultAsync(p => p.User != null && p.User.Id == UserId.Value)
                : null;
        }
    }
#nullable restore
}
