using Abp.Dependency;
using Castle.DynamicProxy;
using Shesha.Extensions;
using Shesha.Reflection;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Shesha.Permissions.Entity
{
    public class PermissionedEntityInterceptor : IPermissionedEntityInterceptor, ISingletonDependency
    {
        void IInterceptor.Intercept(IInvocation invocation)
        {
            var proxy = invocation.Proxy as IPermissionedEntityProxy;
            if (invocation.Method.DeclaringType == typeof(IPermissionedEntityProxy))
            {
                invocation.Proceed();
                return;
            }

            if (proxy != null)
            {
                if (invocation.Method.Name.StartsWith("get_"))
                {
                    var propName = invocation.Method.Name.Substring(4, invocation.Method.Name.Length - 4);
                    var propertyInfo = invocation.Method.DeclaringType?.GetProperty(propName);
                    if (propertyInfo != null)
                    {
                        var propertyType = propertyInfo.PropertyType.StripCastleProxyType();
                        var typeName = propertyType.Name;
                        if (!proxy.Provider.IsPropertyGranted(propertyInfo))
                        {
                            // If the property is not granted, return default value
                            if (typeName == nameof(String))
                                invocation.ReturnValue = "***";
                            else
                            {
                                switch (typeName)
                                {
                                    case "List`1":
                                    case "IList`1":
                                    case "IEnumerable`1":
                                    case "ICollection`1":
                                        var gtn = propertyInfo.PropertyType.GetGenericArguments().First();
                                        var listType = typeof(List<>).MakeGenericType(gtn);
                                        var defList = Activator.CreateInstance(listType);
                                        invocation.ReturnValue = defList;
                                        break;
                                    default:
                                        var def = propertyInfo.PropertyType.GetTypeDefaultValue();
                                        invocation.ReturnValue = def;
                                        break;
                                }
                            }
                            return;
                        }
                        else
                        {
                            // ToDo: handle nested Entities and collections.
                            // Not used now because of performance
                            // For now, this proxy is used only for results of endpoints that returns plain objects and for GQL that handle hierarchy of objects

                            //// If the property is granted, and it is an entity, return proxied entity to check permissions recursively
                            //if (propertyType.IsEntityType())
                            //{
                            //    var value = propertyInfo.GetValue(invocation.InvocationTarget);
                            //    if (value != null)
                            //    {
                            //        invocation.ReturnValue = proxy.Provider.GetNewProxiedPermissionedEntity(value);
                            //        return;
                            //    }
                            //}
                            //// If the property is granted, and it is a collection of entities, return proxied collection
                            //if (propertyType.IsGenericType && propertyType.IsAssignableTo(typeof(IEnumerable)) 
                            //    && propertyInfo.PropertyType.GetGenericArguments().First().IsEntityType())
                            //{
                            //    if (propertyType.IsEntityType())
                            //    {
                            //        var collection = (IEnumerable)propertyInfo.GetValue(invocation.InvocationTarget);
                            //        var proxiedCollection = new List<object>();

                            //        foreach (var item in collection)
                            //            proxiedCollection.Add(proxy.Provider.GetNewProxiedPermissionedEntity(item));

                            //        invocation.ReturnValue = proxiedCollection;
                            //        return;
                            //    }
                            //}
                        }
                    }
                }
            }

            invocation.Proceed();
        }
    }
}
