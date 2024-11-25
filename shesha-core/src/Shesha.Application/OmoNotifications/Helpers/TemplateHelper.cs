using System;
using System.Linq;
using System.Reflection;
using System.Text.RegularExpressions;

namespace Shesha.OmoNotifications.Helpers
{
    public static class TemplateHelper
    {
        public static string ReplacePlaceholders<TData>(string template, TData data)
        {
            if (data == null)
                throw new ArgumentNullException(nameof(data));

            // Use regex to find placeholders in the form {{propertyName}}
            return Regex.Replace(template, @"\{\{(\w+)\}\}", match =>
            {
                var propertyName = match.Groups[1].Value;

                // Use the runtime type of the object for property lookup
                var propertyInfo = data.GetType()
                    .GetProperties(BindingFlags.Public | BindingFlags.Instance)
                    .FirstOrDefault(prop => string.Equals(prop.Name, propertyName, StringComparison.OrdinalIgnoreCase));

                if (propertyInfo == null)
                    throw new ArgumentException($"Property '{propertyName}' not found on {data.GetType().Name}");

                var value = propertyInfo.GetValue(data)?.ToString() ?? string.Empty;
                return value;
            });
        }
    }
}