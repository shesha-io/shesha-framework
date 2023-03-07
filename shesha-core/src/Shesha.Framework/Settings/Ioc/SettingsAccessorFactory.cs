using Abp.Dependency;
using Castle.MicroKernel;
using Shesha.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Shesha.Settings.Ioc
{
    public interface ISettingsAccessorFactory 
    {
        TAccessor BuildAccessor<TAccessor>() where TAccessor : ISettingAccessors;
    }

    public class SettingsAccessorFactory: ISettingsAccessorFactory
    {
        private readonly IocManager _iocManager;
        private readonly Dictionary<Type, Type> _accessorTypes;

        public SettingsAccessorFactory(IocManager iocManager)
        {
            _iocManager = iocManager;
            _accessorTypes = new Dictionary<Type, Type>();
        }

        public TAccessor BuildAccessor<TAccessor>() where TAccessor : ISettingAccessors 
        {
            var builder = new SettingsTypeBuilder();

            var interfaceType = typeof(TAccessor);
            var classType = builder.BuildType(interfaceType);

            var instance = (TAccessor)Activator.CreateInstance(classType);

            // fill all ISettingAccessor properties
            var interfaceProperties = interfaceType.GetProperties().Where(p => typeof(ISettingAccessor).IsAssignableFrom(p.PropertyType)).ToList();
            foreach (var interfaceProperty in interfaceProperties)
            {
                var classProperty = classType.GetProperty(interfaceProperty.Name);

                var settingAccessor = _iocManager.IocContainer.Resolve(interfaceProperty.PropertyType,
                    new Arguments { { "property", interfaceProperty } });

                classProperty.SetValue(instance, settingAccessor);
            }

            return instance;
        }
    }
}
