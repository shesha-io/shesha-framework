using Abp.Threading;
using AutoMapper.Internal;
using Castle.DynamicProxy;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Shesha.DynamicEntities;
using Shesha.DynamicEntities.Binder;
using Shesha.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace Shesha.JsonEntities.Proxy
{
    public interface IJsonEntityProxy
    {
        [JsonIgnore]
        bool _isInitialized { get; }

        [JsonIgnore]
        JObject _json { get; }

        [JsonIgnore]
        Dictionary<string, JsonReference> _references { get; }

        [JsonIgnore]
        bool _isThisChanged { get; }

        [JsonIgnore]
        bool? _innerChanged { get; set; }

        JsonReference? _getEntityReference<T>(Expression<Func<T, object>> expr);

        JsonReference? _getEntityReference(string propName);

        void _initialize(object proxy);
        void _changed();
        void _reset(JObject json, bool isInitialized = true);
    }

    public class JsonEntityProxy : IJsonEntityProxy
    {
        public static Type GetUnproxiedType(Type ptype)
        {
            return ProxyUtil.IsProxyType(ptype) ? ProxyUtil.GetUnproxiedType(ptype) : ptype;
        }

        public static object GetUnproxiedInstance(object pobj)
        {
            return ProxyUtil.IsProxy(pobj) ? ProxyUtil.GetUnproxiedInstance(pobj) : pobj;
        }

        public static JObject GetJson(object proxyObj, JObject? jObj = null)
        {
            JObject json = jObj ?? new JObject();
            if (proxyObj == null) return json;

            var proxy = proxyObj as IJsonEntityProxy;
            if (proxy != null)
            {
                if (!proxy._isInitialized || !JsonEntityProxy.IsChanged(proxy))
                    return proxy._json;
                else
                    proxyObj = JsonEntityProxy.GetUnproxiedInstance(proxy);
            }
            ObjectToJsonExtension.ObjectToJObject(proxyObj, json);
            if (proxy != null) proxy._reset(json);
            return json;
        }
        
        public static bool IsChanged(object? proxyObj)
        {
            if (proxyObj == null) return false;

            var proxy = proxyObj as IJsonEntityProxy;
            if (proxy == null || proxy._isThisChanged) return true;
            if (!proxy._isInitialized) return false;
            //if (proxy._innerChanged != null) return proxy._innerChanged.Value;

            var obj = JsonEntityProxy.GetUnproxiedInstance(proxy);
            if (obj == null) return true;

            proxy._innerChanged = false;
            var props = obj.GetType().GetProperties().Where(p => p.CanRead && p.IsPublic());
            foreach (var prop in props)
            {
                var val = prop.GetValue(obj) as IJsonEntityProxy;
                if (val == null) continue;
                var b = JsonEntityProxy.IsChanged(val);
                if (b)
                {
                    proxy._innerChanged = true;
                    break;
                }
            }
            return proxy._innerChanged.Value;
        }

        [JsonIgnore]
        public virtual bool _isInitialized { get; internal set; } = false;

        [JsonIgnore]
        public virtual JObject _json { get; internal set; }

        [JsonIgnore]
        public virtual Dictionary<string, JsonReference> _references { get; } = new ();

        [JsonIgnore]
        public virtual bool _isThisChanged { get; internal set; } = false;

        [JsonIgnore]
        public virtual bool? _innerChanged { get; set; } = false;

        private readonly IJsonEntityProxyFactory _factory;

        public JsonEntityProxy(JObject json, IJsonEntityProxyFactory factory)
        {
            _json = json;
            _factory = factory;
        }

        public virtual JsonReference? _getEntityReference<T>(Expression<Func<T, object>> expr)
        {
            if (expr is LambdaExpression lambda)
                if (lambda.Body is MemberExpression member)
                    return _getEntityReference(member.Member.Name);
            throw new NotSupportedException("Expression is incorrect, please use only properties");
        }

        public virtual JsonReference? _getEntityReference(string propName)
        {
            return _references.ContainsKey(propName) ? _references[propName] : null;
        }

        public void _initialize(object proxy)
        {
            var context = new EntityModelBindingContext()
            {
                GetEntityById = (entityType, id, displayName, propPath, ctx) =>
                {
                    _references.Add(
                        propPath.Split(".").Last(),
                        new JsonReference() { Id = id, _displayName = displayName, _className = entityType.FullName }
                    );
                    return null;
                },
                GetObjectOrObjectReference = (objectType, jobject, ctx, formFields) =>
                {
                    return _factory.GetNewProxiedJsonEntity(objectType, jobject);
                }
            };
            var modelBinder = StaticContext.IocManager.Resolve<IEntityModelBinder>();
            AsyncHelper.RunSync(async () => await modelBinder.BindPropertiesAsync(_json, proxy, context));

            _isInitialized = true;
        }

        public void _changed()
        {
            _isThisChanged = true;
        }

        public void _reset(JObject json, bool isInitialized = true)
        {
            _json = json;
            _isInitialized = isInitialized;
            _innerChanged = null;
            
            var obj = JsonEntityProxy.GetUnproxiedInstance(this);
        }
    }
}