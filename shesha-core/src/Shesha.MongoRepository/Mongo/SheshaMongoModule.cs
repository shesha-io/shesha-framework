﻿using Abp.Modules;
using Abp.Zero;
using Castle.MicroKernel.Registration;
using System.Reflection;

namespace Shesha.MongoRepository.Mongo
{
    /// <summary>
    /// This module extends module zero to add LDAP authentication.
    /// </summary>
    [DependsOn(typeof(AbpZeroCommonModule))]
    public class SheshaMongoModule : AbpModule
    {
        public override void PreInitialize()
        {

        }

        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(Assembly.GetExecutingAssembly());

            IocManager.IocContainer.Register(
                  Component.For(typeof(IMongoRepository<>)).ImplementedBy(typeof(MongoRepository<>)).LifestyleTransient()
            );
        }
    }
}
