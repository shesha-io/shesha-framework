using Abp;
using Abp.Dependency;
using Abp.Domain.Uow;
using Abp.Modules;
using Abp.Runtime.Session;
using Abp.TestBase.Runtime.Session;
using Castle.MicroKernel.Registration;
using Shesha.Services;
using Shesha.Tests.Fixtures;
using System;
using System.Reflection;
using System.Threading.Tasks;

namespace Shesha.Tests
{
    /// <summary>
    /// This is the base class for all tests integrated to ABP.
    /// </summary>
    public abstract class ShaIntegratedTestBase<TStartupModule> : IDisposable
        where TStartupModule : AbpModule
    {
        private readonly IIocManager? _ownIocManager;
        private readonly IIocManager? _externalIocManager;

        /// <summary>
        /// Local <see cref="IIocManager"/> used for this test.
        /// </summary>
        protected IIocManager LocalIocManager => _externalIocManager ?? _ownIocManager ?? throw new Exception($"Failed to get IocManager. Looks like `{this.GetType().FullName}` has been initialized by a wrong way.");

        protected AbpBootstrapper AbpBootstrapper { get; }

        /// <summary>
        /// Gets Session object. Can be used to change current user and tenant in tests.
        /// </summary>
        protected TestAbpSession AbpSession { get; private set; }

        protected ShaIntegratedTestBase(IDatabaseFixture databaseFixture, bool initializeAbp = true, IIocManager? localIocManager = null)
        {
            _externalIocManager = localIocManager;
            if (localIocManager == null)
                _ownIocManager = new IocManager();
            StaticContext.SetIocManager(LocalIocManager);

            LocalIocManager.IocContainer.Register(
                Component.For<IDatabaseFixture>().Instance(databaseFixture)
            );

            AbpBootstrapper = AbpBootstrapper.Create<TStartupModule>(options =>
            {
                options.IocManager = LocalIocManager;
            });

            if (initializeAbp)
            {
                InitializeAbp();
            }
        }

        protected void InitializeAbp()
        {
            LocalIocManager.RegisterIfNot<IAbpSession, TestAbpSession>();

            PreInitialize();

            AbpBootstrapper.Initialize();

            PostInitialize();

            AbpSession = LocalIocManager.Resolve<TestAbpSession>();
        }

        /// <summary>
        /// This method can be overrided to replace some services with fakes.
        /// </summary>
        protected virtual void PreInitialize()
        {

        }

        /// <summary>
        /// This method can be overrided to replace some services with fakes.
        /// </summary>
        protected virtual void PostInitialize()
        {

        }

        public virtual void Dispose()
        {
            AbpBootstrapper.Dispose();
            LocalIocManager.Dispose();
        }

        /// <summary>
        /// A shortcut to resolve an object from <see cref="LocalIocManager"/>.
        /// Also registers <typeparamref name="T"/> as transient if it's not registered before.
        /// </summary>
        /// <typeparam name="T">Type of the object to get</typeparam>
        /// <returns>The object instance</returns>
        protected T Resolve<T>()
        {
            EnsureClassRegistered(typeof(T));
            return LocalIocManager.Resolve<T>();
        }

        /// <summary>
        /// A shortcut to resolve an object from <see cref="LocalIocManager"/>.
        /// Also registers <typeparamref name="T"/> as transient if it's not registered before.
        /// </summary>
        /// <typeparam name="T">Type of the object to get</typeparam>
        /// <param name="argumentsAsAnonymousType">Constructor arguments</param>
        /// <returns>The object instance</returns>
        protected T Resolve<T>(object argumentsAsAnonymousType)
        {
            EnsureClassRegistered(typeof(T));
            return LocalIocManager.Resolve<T>(argumentsAsAnonymousType);
        }

        /// <summary>
        /// A shortcut to resolve an object from <see cref="LocalIocManager"/>.
        /// Also registers <paramref name="type"/> as transient if it's not registered before.
        /// </summary>
        /// <param name="type">Type of the object to get</param>
        /// <returns>The object instance</returns>
        protected object Resolve(Type type)
        {
            EnsureClassRegistered(type);
            return LocalIocManager.Resolve(type);
        }

        /// <summary>
        /// A shortcut to resolve an object from <see cref="LocalIocManager"/>.
        /// Also registers <paramref name="type"/> as transient if it's not registered before.
        /// </summary>
        /// <param name="type">Type of the object to get</param>
        /// <param name="argumentsAsAnonymousType">Constructor arguments</param>
        /// <returns>The object instance</returns>
        protected object Resolve(Type type, object argumentsAsAnonymousType)
        {
            EnsureClassRegistered(type);
            return LocalIocManager.Resolve(type, argumentsAsAnonymousType);
        }

        /// <summary>
        /// Registers given type if it's not registered before.
        /// </summary>
        /// <param name="type">Type to check and register</param>
        /// <param name="lifeStyle">Lifestyle</param>
        protected void EnsureClassRegistered(Type type, DependencyLifeStyle lifeStyle = DependencyLifeStyle.Transient)
        {
            if (!LocalIocManager.IsRegistered(type))
            {
                if (!type.GetTypeInfo().IsClass || type.GetTypeInfo().IsAbstract)
                {
                    throw new AbpException("Can not register " + type.Name + ". It should be a non-abstract class. If not, it should be registered before.");
                }

                LocalIocManager.Register(type, lifeStyle);
            }
        }

        protected virtual void WithUnitOfWork(Action action, UnitOfWorkOptions? options = null)
        {
            using (var uowManager = LocalIocManager.ResolveAsDisposable<IUnitOfWorkManager>())
            {
                using (var uow = uowManager.Object.Begin(options ?? new UnitOfWorkOptions()))
                {
                    action();
                    uow.Complete();
                }
            }
        }

        protected virtual void WithUnitOfWork(int? tenantId, Action action, UnitOfWorkOptions? options = null)
        {
            using (var uowManager = LocalIocManager.ResolveAsDisposable<IUnitOfWorkManager>())
            {
                using (var uow = uowManager.Object.Begin(options ?? new UnitOfWorkOptions()))
                {
                    using (uowManager.Object.Current.SetTenantId(tenantId))
                    {
                        action();
                        uow.Complete();
                    }
                }
            }
        }

        protected virtual async Task WithUnitOfWorkAsync(Func<Task> action, UnitOfWorkOptions? options = null)
        {
            using (var uowManager = LocalIocManager.ResolveAsDisposable<IUnitOfWorkManager>())
            {
                using (var uow = uowManager.Object.Begin(options ?? new UnitOfWorkOptions()))
                {
                    await action();
                    await uow.CompleteAsync();
                }
            }
        }

        protected async Task WithUnitOfWorkAsync(int? tenantId, Func<Task> action, UnitOfWorkOptions? options = null)
        {
            using (var uowManager = LocalIocManager.ResolveAsDisposable<IUnitOfWorkManager>())
            {
                using (var uow = uowManager.Object.Begin(options ?? new UnitOfWorkOptions()))
                {
                    using (uowManager.Object.Current.SetTenantId(tenantId))
                    {
                        await action();
                        await uow.CompleteAsync();
                    }
                }
            }
        }
    }
}
