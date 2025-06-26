using Abp;
using Abp.Authorization.Users;
using Abp.Dependency;
using Abp.Domain.Uow;
using Abp.Modules;
using Abp.MultiTenancy;
using Abp.Runtime.Session;
using NHibernate;
using NHibernate.Linq;
using Shesha.Authorization.Users;
using Shesha.Domain;
using Shesha.MultiTenancy;
using Shesha.NHibernate.UoW;
using Shesha.Tests.Fixtures;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Tests
{
    public abstract class SheshaNhTestBase<TStartupModule> : ShaIntegratedTestBase<TStartupModule> where TStartupModule : AbpModule
    {
        protected SheshaNhTestBase(IDatabaseFixture fixture) : base(fixture)
        {
            LoginAsHostAdmin();

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

        protected void LoginAsDefaultTenantAdmin()
        {
            LoginAsTenant(AbpTenantBase.DefaultTenantName, AbpUserBase.AdminUserName);
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

        protected void LoginAsTenant(string tenancyName, string userName)
        {
            var tenant = UsingDbSession(session => session.Query<Tenant>().FirstOrDefault(t => t.TenancyName == tenancyName));
            if (tenant == null)
            {
                throw new Exception("There is no tenant: " + tenancyName);
            }

            AbpSession.TenantId = tenant.Id;

            var user =
                UsingDbSession(
                    session =>
                        session.Query<User>().FirstOrDefault(u => u.TenantId == AbpSession.TenantId && u.UserName == userName));
            if (user == null)
            {
                throw new Exception("There is no user: " + userName + " for tenant: " + tenancyName);
            }

            AbpSession.UserId = user.Id;
        }

        #endregion

        /// <summary>
        /// Gets current user if <see cref="IAbpSession.UserId"/> is not null.
        /// Throws exception if it's null.
        /// </summary>
        protected async Task<User> GetCurrentUserAsync()
        {
            var userId = AbpSession.GetUserId();
            return await UsingDbSession(session => session.Query<User>().SingleAsync(u => u.Id == userId));
        }

        /// <summary>
        /// Gets current tenant if <see cref="IAbpSession.TenantId"/> is not null.
        /// Throws exception if there is no current tenant.
        /// </summary>
        protected async Task<Tenant> GetCurrentTenantAsync()
        {
            var tenantId = AbpSession.GetTenantId();
            return await UsingDbSession(session => session.Query<Tenant>().SingleAsync(t => t.Id == tenantId));
        }

        protected void UsingNhSession(Action<ISession> action)
        {
            using (var uow = NewNhUnitOfWork())
            {
#pragma warning disable IDISP001 // Dispose created
                var session = uow.GetSession();
#pragma warning restore IDISP001 // Dispose created
                action.Invoke(session);
                uow.Complete();
            }
        }

        protected NhUnitOfWork NewNhUnitOfWork() 
        {
            var unitOfWorkManager = Resolve<IUnitOfWorkManager>();
            return unitOfWorkManager.Begin() is NhUnitOfWork nhuow
                ? nhuow
                : throw new Exception($"Unexpected type of UnitOfWork. Expected '{nameof(NhUnitOfWork)}'");
        }

        protected virtual async Task<TResult> WithUnitOfWorkAsync<TResult>(Func<Task<TResult>> action, UnitOfWorkOptions? options = null)
        {
            using (var uowManager = LocalIocManager.ResolveAsDisposable<IUnitOfWorkManager>())
            {
                using (var uow = uowManager.Object.Begin(options ?? new UnitOfWorkOptions()))
                {
                    var result = await action();
                    await uow.CompleteAsync();
                    return result;
                }
            }
        }
    }

    public abstract class SheshaNhTestBase : SheshaNhTestBase<SheshaTestModule>
    {
        protected SheshaNhTestBase(IDatabaseFixture fixture) : base(fixture)
        {
        }
    }
}
