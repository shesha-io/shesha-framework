using Abp;
using Abp.Modules;
using Castle.MicroKernel.Registration;
using Shesha.Redis.Caching;
using Shesha.Redis.Locking;
using System.Reflection;

namespace Shesha.Redis
{
    [DependsOn(typeof(AbpKernelModule))]
    public class SheshaRedisModule : AbpModule
    {
        private LockFactoryHolder _redisLockFactoryHolder;

        public SheshaRedisModule()
        {
            _redisLockFactoryHolder = new LockFactoryHolder();
        }

        public override void PreInitialize()
        {
            IocManager.Register<ShaRedisCacheOptions>();

            // initialize distributed locks using Redis
            IocManager.IocContainer.Register(Component.For<ILockFactoryHolder>().UsingFactoryMethod(() => _redisLockFactoryHolder));
        }

        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(typeof(SheshaRedisModule).GetTypeInfo().Assembly);
        }

        public override void Shutdown()
        {
            base.Shutdown();

            _redisLockFactoryHolder?.Dispose();
        }
    }
}
