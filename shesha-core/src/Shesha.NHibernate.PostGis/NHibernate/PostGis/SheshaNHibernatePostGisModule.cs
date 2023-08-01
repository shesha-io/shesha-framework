using Abp;
using Abp.AspNetCore;
using Abp.Modules;
using Shesha.NHibernate.Connection;
using System.Reflection;

namespace Shesha.NHibernate.PostGis
{
    [DependsOn(typeof(AbpKernelModule), typeof(AbpAspNetCoreModule), typeof(SheshaNHibernateModule))]
    public class SheshaNHibernatePostGisModule : AbpModule
    {
        public override void PreInitialize()
        {
            IocManager.Register<IDbConnectionFactory, ConnectionFactory>(Abp.Dependency.DependencyLifeStyle.Singleton);

            IocManager.RegisterAssemblyByConvention(Assembly.GetExecutingAssembly());
        }
    }
}
