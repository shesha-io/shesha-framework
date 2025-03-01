using System;
using System.Linq;
using System.Reflection;
using System.Text.RegularExpressions;

namespace Shesha.Notifications.Helpers
{
    public static class TemplateHelper
    {
        // TODO: review and this implementation
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

                return propertyInfo != null
                    ? propertyInfo.GetValue(data)?.ToString() ?? string.Empty
                    : string.Empty;
            });
        }
    }
}