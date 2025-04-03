using System.Diagnostics.CodeAnalysis;
using System.Reflection;

namespace Shesha.Reflection
{
    public static partial class ReflectionHelper
    {
        public class PropertyValueAccessor 
        {
            public PropertyInfo? PropInfo { get; private set; }
            public object? Parent { get; private set; }

            [MemberNotNullWhen(true, nameof(PropInfo), nameof(Parent))]
            public bool IsValueAvailable => Parent != null && PropInfo!= null;

            public object? Value => IsValueAvailable ? PropInfo.GetValue(Parent, null) : null;

            public PropertyValueAccessor(PropertyInfo? propInfo, object? parent)
            {
                PropInfo = propInfo;
                Parent = parent;
            }
        }
    }
}
