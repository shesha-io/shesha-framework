using Abp.Dependency;
using Abp.Extensions;
using Abp.Reflection;
using Castle.DynamicProxy;
using Shesha.EntityReferences;
using Shesha.Extensions;
using Shesha.Reflection;
using Shesha.Services;
using System.Linq;

namespace Shesha.JsonEntities.Proxy
{
    public class JsonEntityInterceptor : IJsonEntityInterceptor, ISingletonDependency
    {
        private readonly IDynamicRepository _dynamicRepository;
        private readonly IIocManager _iocManager;

        public JsonEntityInterceptor(
            IDynamicRepository dynamicRepository,
            IIocManager iocManager
        )
        {
            _dynamicRepository = dynamicRepository;
            _iocManager = iocManager;
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

                if (invocation.Method.Name.StartsWith("set_")
                    && (invocation.Method.GetParameters()[0].ParameterType.IsEntityType() || invocation.Method.GetParameters()[0].ParameterType == typeof(GenericEntityReference)))
                {
                    var propName = invocation.Method.Name.Substring(4, invocation.Method.Name.Length - 4);
                    var objType = invocation.InvocationTarget.GetType();
                    var property = objType.GetProperty(propName);
                    if (property != null)
                    {
                        property.SetValue(invocation.InvocationTarget, invocation.Arguments[0]);
                        var genericEntityReference = invocation.Arguments[0] as GenericEntityReference;
                        var eref = genericEntityReference != null
                            ? new JsonReference()
                            {
                                Id = genericEntityReference.Id,
                                _displayName = genericEntityReference._displayName,
                                _className = genericEntityReference._className,
                            }
                            : new JsonReference()
                            {
                                Id = invocation.Arguments[0]?.GetId(),
                                _displayName = invocation.Arguments[0]?.GetEntityDisplayName(),
                                _className = invocation.Arguments[0]?.GetType().FullName,
                            };
                        if (proxy._references.ContainsKey(propName.ToCamelCase()))
                            proxy._references[propName.ToCamelCase()] = eref;
                        else
                            proxy._references.Add(propName.ToCamelCase(), eref);
                    }
                    return;
                }

                if (invocation.Method.Name.StartsWith("get_")
                    && (invocation.Method.ReturnType.IsEntityType() || invocation.Method.ReturnType == typeof(GenericEntityReference)))
                {
                    var propName = invocation.Method.Name.Substring(4, invocation.Method.Name.Length - 4);
                    var objType = invocation.InvocationTarget.GetType();
                    var property = objType.GetProperty(propName);
                    if (property != null)
                    {
                        var value = property.GetValue(invocation.InvocationTarget);
                        if (value == null)
                        {
                            var eref = proxy._getEntityReference(propName.ToCamelCase());
                            var stringId = eref?.Id?.ToString();
                            if (eref != null && !string.IsNullOrWhiteSpace(stringId))
                            {
                                value = property.PropertyType == typeof(GenericEntityReference) 
                                    ? new GenericEntityReference(stringId, eref._className.NotNull(), eref._displayName)
                                    : _dynamicRepository.Get(property.PropertyType, stringId);

                                property.SetValue(invocation.InvocationTarget, value);
                            }
                        }
                        invocation.ReturnValue = value;
                    }
                    return;
                }
            }

            invocation.Proceed();
        }
    }
}
