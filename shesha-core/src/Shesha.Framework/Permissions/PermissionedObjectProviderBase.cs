using System;
using System.ComponentModel;
using System.Reflection;
using System.Xml;
using Abp.Dependency;
using Abp.Reflection;
using Shesha.Reflection;
using Shesha.Utilities;

namespace Shesha.Permissions
{
    public class PermissionedObjectProviderBase : ITransientDependency
    {
        protected readonly IAssemblyFinder _assembleFinder;

        public PermissionedObjectProviderBase(IAssemblyFinder assembleFinder)
        {
            _assembleFinder = assembleFinder;
        }

        protected string GetName(Type service)
        {
            var name = service.GetCustomAttribute<DisplayNameAttribute>()?.DisplayName;
            return string.IsNullOrEmpty(name) ? service.Name : name;
        }

        protected string GetDescription(Type service)
        {
            var description = service.GetCustomAttribute<DescriptionAttribute>()?.Description;
            if (string.IsNullOrEmpty(description))
            {
                XmlElement documentation = DocsByReflection.XMLFromType(service);
                description = documentation?["summary"]?.InnerText.Trim();
                if (string.IsNullOrEmpty(description))
                {
                    description = service.Name.ToFriendlyName();
                }
            }

            return description;
        }

        protected string GetName(MethodInfo method)
        {
            var name = method.GetCustomAttribute<DisplayNameAttribute>()?.DisplayName;
            return string.IsNullOrEmpty(name) ? method.Name : name;
        }

        protected string GetDescription(MethodInfo method)
        {
            var description = method.GetCustomAttribute<DescriptionAttribute>()?.Description;
            if (string.IsNullOrEmpty(description))
            {
                XmlElement documentation = DocsByReflection.XMLFromMember(method);
                description = documentation?["summary"]?.InnerText.Trim();
                if (string.IsNullOrEmpty(description))
                {
                    description = method.Name.ToFriendlyName().Replace(" Async", "");
                }
            }

            return description;
        }
    }
}