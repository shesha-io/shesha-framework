using Abp.Modules;
using Abp.Runtime.Caching.Redis;
using Castle.MicroKernel.Registration;

namespace Shesha.Redis
{
    [DependsOn(
        typeof(AbpRedisCacheModule)
     )]
    public class SheshaRedisModule : AbpModule
    {
        private LockFactoryHolder _redisLockFactoryHolder;

        public SheshaRedisModule()
        {
            _redisLockFactoryHolder = new LockFactoryHolder();
        }

        public override void PreInitialize()
        {
            // initialize distributed locks using Redis
            IocManager.IocContainer.Register(Component.For<ILockFactoryHolder>().UsingFactoryMethod(() => _redisLockFactoryHolder));

            // note: for test purposes only
            // Configuration.ReplaceService<IRedisCacheSerializer, SheshaRedisCacheSerializer>(DependencyLifeStyle.Transient);
        }

        public override void Shutdown()
        {
            base.Shutdown();

            _redisLockFactoryHolder?.Dispose();
        }
    }
}
