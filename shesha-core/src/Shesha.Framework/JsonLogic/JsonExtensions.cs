using Newtonsoft.Json.Linq;
using System;
using System.Diagnostics.CodeAnalysis;

namespace Shesha.JsonLogic
{
    /// <summary>
    /// Json extensions
    /// </summary>
    public static class JsonExtensions
    {
        /// <summary>
        /// Returns true if <paramref name="token"/> is null or empty
        /// </summary>
        /// <param name="token"></param>
        /// <returns></returns>
        public static bool IsNullOrEmpty([NotNullWhen(false)]this JToken? token)
        {
            return (token == null) ||
                   (token.Type == JTokenType.Array && !token.HasValues) ||
                   (token.Type == JTokenType.Object && !token.HasValues) ||
                   (token.Type == JTokenType.String && token.ToString() == String.Empty) ||
                   (token.Type == JTokenType.Null);
        }

        /// <summary>
        /// Returns true if <paramref name="token"/> is null
        /// </summary>
        /// <param name="token"></param>
        /// <returns></returns>
        public static bool IsNull([NotNullWhen(true)] this JToken? token)
        {
            return (token == null) ||
                   (token.Type == JTokenType.Array && !token.HasValues) ||
                   (token.Type == JTokenType.Object && !token.HasValues) ||
                   (token.Type == JTokenType.Null);
        }
    }
}
