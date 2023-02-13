using Abp.Dependency;
using Abp.Extensions;
using Castle.DynamicProxy;
using Shesha.Extensions;
using Shesha.Services;

namespace Shesha.JsonEntities.Proxy
{
    public class JsonEntityInterceptor : IJsonEntityInterceptor, ISingletonDependency
    {
        private readonly IDynamicRepository _dynamicRepository;

        public JsonEntityInterceptor(IDynamicRepository dynamicRepository)
        {
            _dynamicRepository = dynamicRepository;
        }

        public void Intercept(IInvocation invocation)
        {
            var proxy = invocation.Proxy as IJsonEntityProxy;
            if (invocation.Method.DeclaringType == typeof(IJsonEntityProxy))
            {
                invocation.Proceed();
                return;
            }

            if (proxy != null)
            {
                if (!proxy._isInitialized)
                    proxy._initialize(invocation.InvocationTarget);

                // capture changes for further serialization
                if (invocation.Method.Name.StartsWith("set_"))
                    proxy._changed();

                if (invocation.Method.Name.StartsWith("set_") && invocation.Method.GetParameters()[0].ParameterType.IsEntityType())
                {
                    var propName = invocation.Method.Name.Substring(4, invocation.Method.Name.Length - 4);
                    var objType = invocation.InvocationTarget.GetType();
                    var property = objType.GetProperty(propName);
                    if (property != null)
                    {
                        property.SetValue(invocation.InvocationTarget, invocation.Arguments[0]);
                        var eref = new JsonReference() { Id = invocation.Arguments[0]?.GetId(), _displayName = invocation.Arguments[0]?.GetDisplayName() };
                        if (proxy._references.ContainsKey(propName.ToCamelCase()))
                            proxy._references[propName.ToCamelCase()] = eref;
                        else
                            proxy._references.Add(propName.ToCamelCase(), eref);
                    }
                    return;
                }
 
                if (invocation.Method.Name.StartsWith("get_") && invocation.Method.ReturnType.IsEntityType())
                {
                    var propName = invocation.Method.Name.Substring(4, invocation.Method.Name.Length - 4);
                    var eref = proxy._getEntityReference(propName.ToCamelCase());
                    if (eref?.Id != null)
                    {
                        var objType = invocation.InvocationTarget.GetType();
                        var property = objType.GetProperty(propName);
                        if (property != null)
                        {
                            var value = property.GetValue(invocation.InvocationTarget);
                            if (value == null)
                            {
                                value = _dynamicRepository.Get(property.PropertyType, eref?.Id.ToString());
                                property.SetValue(invocation.InvocationTarget, value);
                            }
                            invocation.ReturnValue = value;
                        }
                    }
                    return;
                }
            }

            invocation.Proceed();
        }
    }
}
