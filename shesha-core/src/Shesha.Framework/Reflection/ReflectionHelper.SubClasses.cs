using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Reflection;

namespace Shesha.Reflection
{
    public static partial class ReflectionHelper
    {
#nullable enable
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

        public class PropertyInfoWithPath 
        { 
            /// <summary>
            /// Property info
            /// </summary>
            public PropertyInfo PropertyInfo { get; private set; }
            /// <summary>
            /// Real relative path to property (without conversion to camelCase or any other cases)
            /// </summary>
            public List<string> Path { get; private set; }

            public PropertyInfoWithPath(PropertyInfo propertyInfo, List<string> path)
            {
                PropertyInfo = propertyInfo;
                Path = path;
            }
        }
#nullable restore
    }
}
