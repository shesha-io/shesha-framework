﻿using Abp.Dependency;
using Castle.MicroKernel;
using Shesha.Extensions;
using Shesha.Reflection;
using System.Linq;

namespace Shesha.Settings.Ioc
{
    public interface ISettingsAccessorFactory 
    {
        TAccessor BuildAccessor<TAccessor>() where TAccessor : class, ISettingAccessors;
    }

    public class SettingsAccessorFactory: ISettingsAccessorFactory
    {
        private readonly IocManager _iocManager;

        public SettingsAccessorFactory(IocManager iocManager)
        {
            _iocManager = iocManager;
        }

        public TAccessor BuildAccessor<TAccessor>() where TAccessor : class, ISettingAccessors 
        {
            var builder = new SettingsTypeBuilder();

            var interfaceType = typeof(TAccessor);
            var classType = builder.BuildType(interfaceType);

            var instance = ActivatorHelper.CreateNotNullObject(classType).ForceCastAs<TAccessor>();

            // fill all ISettingAccessor properties
            var interfaceProperties = interfaceType.GetProperties().Where(p => typeof(ISettingAccessor).IsAssignableFrom(p.PropertyType)).ToList();
            foreach (var interfaceProperty in interfaceProperties)
            {
                var classProperty = classType.GetRequiredProperty(interfaceProperty.Name);

                var settingAccessor = _iocManager.IocContainer.Resolve(interfaceProperty.PropertyType,
                    new Arguments { { "property", interfaceProperty } });

                classProperty.SetValue(instance, settingAccessor);
            }

            return instance;
        }
    }
}
