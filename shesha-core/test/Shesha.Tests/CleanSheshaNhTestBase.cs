using Abp;
using Abp.Authorization.Users;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Modules;
using NHibernate;
using Shesha.Authorization.Users;
using Shesha.Domain;
using Shesha.Enterprise.Tests;
using Shesha.Enterprise.Tests.Fixtures;
using Shesha.Services;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Tests
{
    public abstract class CleanSheshaNhTestBase<TStartupModule> : ShaIntegratedTestBase<TStartupModule> where TStartupModule : AbpModule
    {
        protected readonly IUnitOfWorkManager UnitOfWorkManager;

        protected CleanSheshaNhTestBase(IDatabaseFixture fixture) : base(fixture)
        {
            if (fixture.IsDbAvailable) 
            {
                // Seed initial data for host
                AbpSession.TenantId = null;
                LoginAsHostAdmin();
                
                UnitOfWorkManager = Resolve<IUnitOfWorkManager>();
            }

            StaticContext.SetIocManager(LocalIocManager);
            EntityHelper.RefreshStore(LocalIocManager);            
        }

        #region UsingDbSession

        protected IDisposable UsingTenantId(int? tenantId)
        {
            var previousTenantId = AbpSession.TenantId;
            AbpSession.TenantId = tenantId;
            return new DisposeAction(() => AbpSession.TenantId = previousTenantId);
        }

        protected void UsingDbSession(Action<ISession> action)
        {
            UsingDbSession(AbpSession.TenantId, action);
        }

        protected Task UsingDbSessionAsync(Func<ISession, Task> action)
        {
            return UsingDbSessionAsync(AbpSession.TenantId, action);
        }

        protected T UsingDbSession<T>(Func<ISession, T> func)
        {
            return UsingDbSession(AbpSession.TenantId, func);
        }

        protected Task<T> UsingDbSessionAsync<T>(Func<ISession, Task<T>> func)
        {
            return UsingDbSessionAsync(AbpSession.TenantId, func);
        }

        protected void UsingDbSession(int? tenantId, Action<ISession> action)
        {
            using (UsingTenantId(tenantId))
            {
                using (var session = OpenSession())
                {
                    action(session);
                    session.Flush();
                }
            }
        }

        private ISession OpenSession()
        {
            return LocalIocManager.Resolve<ISessionFactory>().OpenSession();
        }

        protected async Task UsingDbSessionAsync(int? tenantId, Func<ISession, Task> action)
        {
            using (UsingTenantId(tenantId))
            {
                using (var session = OpenSession())
                {
                    await action(session);
                    await session.FlushAsync();
                }
            }
        }

        protected T UsingDbSession<T>(int? tenantId, Func<ISession, T> func)
        {
            T result;

            using (UsingTenantId(tenantId))
            {
                using (var session = OpenSession())
                {
                    result = func(session);
                    session.Flush();
                }
            }

            return result;
        }

        protected async Task<T> UsingDbSessionAsync<T>(int? tenantId, Func<ISession, Task<T>> func)
        {
            T result;

            using (UsingTenantId(tenantId))
            {
                using (var session = OpenSession())
                {
                    result = await func(session);
                    await session.FlushAsync();
                }
            }

            return result;
        }

        #endregion

        #region Login

        protected void LoginAsHostAdmin()
        {
            LoginAsHost(AbpUserBase.AdminUserName);
        }

        protected void LoginAsHost(string userName)
        {
            AbpSession.TenantId = null;

            var user =
                UsingDbSession(
                    session =>
                        session.Query<User>().FirstOrDefault(u => u.TenantId == AbpSession.TenantId && u.UserName == userName));
            if (user == null)
            {
                throw new Exception("There is no user: " + userName + " for host.");
            }

            AbpSession.UserId = user.Id;
        }

        #endregion

        #region UnitOfWork

        protected async Task UsingUnitOfWorkAsync(Func<Task> func) 
        {
            using (var uow = UnitOfWorkManager.Begin())
            {
                await func.Invoke();
                await uow.CompleteAsync();
            }
        }
        
        protected async Task<T> UsingUnitOfWorkAsync<T>(Func<Task<T>> func)
        {
            using (var uow = UnitOfWorkManager.Begin())
            {
                var result = await func.Invoke();
                await uow.CompleteAsync();

                return result;
            }            
        }

        #endregion

        protected async Task<Person?> GetCurrentPersonOrNullAsync()
        {
            if (AbpSession.UserId.HasValue)
            {
                var personRepository = Resolve<IRepository<Person, Guid>>();
                var person = await UsingUnitOfWorkAsync(async () =>
                {
                    return await personRepository.FirstOrDefaultAsync(p => p.User != null && p.User.Id == AbpSession.UserId);
                });
                return person;
            }
            else
                return null;
        }

        protected async Task<Guid?> GetCurrentPersonIdOrNullAsync() 
        {
            var person = await GetCurrentPersonOrNullAsync();
            return person?.Id;
        }

        internal async Task<User> CreateUserAsync(string userName, Action<Person>? preparePersonAction) 
        {
            var userManager = Resolve<UserManager>();
            var defaultPassword = "123qwe";
            var user = await userManager.CreateUserAsync(
                userName,
                true,
                defaultPassword,
                defaultPassword,
                userName,
                userName,
                null,
                $"{userName}@localhost"
            );

            var personRepository = Resolve<IRepository<Person, Guid>>();
            var person = new Person
            {
                User = user,
                FirstName = userName,
                LastName = userName,
            };
            preparePersonAction?.Invoke(person);
            await personRepository.InsertAsync(person);

            await UnitOfWorkManager.Current.SaveChangesAsync();

            return user;
        }        
    }    
}
