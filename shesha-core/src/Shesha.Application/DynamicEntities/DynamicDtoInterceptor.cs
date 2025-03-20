using Castle.DynamicProxy;
using Shesha.Extensions;
using Shesha.Reflection;
using System.Collections.Generic;

namespace Shesha.DynamicEntities
{
    public class DynamicDtoInterceptor : IInterceptor
    {
        private string _name;
        private DynamicDtoInterceptor _parent;

        private Dictionary<string, object?> _changes = new ();

        private bool _isChanged = false;

        public DynamicDtoInterceptor()
        {
        }

        public DynamicDtoInterceptor(string name, DynamicDtoInterceptor parent)
        {
            _parent = parent;
            _name = name;
        }

        public void ResetState()
        {
            _isChanged = false;
            _changes.Clear();
        }

        public void Change(string name, object? value)
        {
            if (_changes.ContainsKey(name)) _changes[name] = value;
            else _changes.Add(name, value);
            _isChanged = true;

            _parent?.Change($"{_name}.{name}", value);
        }

        public void Intercept(IInvocation invocation)
        {
            if (invocation.Method.Name == nameof(IDynamicDtoInputProxy.ResetState))
            {
                ResetState();
                return;
            }
            if (invocation.Method.Name == $"get_{nameof(IDynamicDtoInputProxy.Changes)}")
            {
                invocation.ReturnValue = _changes;
                return;
            }
            if (invocation.Method.Name == $"get_{nameof(IDynamicDtoInputProxy.IsChanged)}")
            {
                invocation.ReturnValue = _isChanged;
                return;
            }

            if (invocation.Method.Name.StartsWith("set_"))
            {
                var propName = invocation.Method.Name.Substring(4, invocation.Method.Name.Length - 4);
                var prop = invocation.InvocationTarget.GetType().GetProperty(propName);
                if (prop != null)
                {
                    var val = prop.GetValue(invocation.InvocationTarget, null);
                    if (!val.NullEquals(invocation.Arguments[0]))
                    {
                        Change(prop.Name, val);
                    }
                }

            }
            invocation.Proceed();
        }
    }
}