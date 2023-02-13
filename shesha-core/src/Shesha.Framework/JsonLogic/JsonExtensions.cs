using Newtonsoft.Json.Linq;
using System;

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
        public static bool IsNullOrEmpty(this JToken token)
        {
            return (token == null) ||
                   (token.Type == JTokenType.Array && !token.HasValues) ||
                   (token.Type == JTokenType.Object && !token.HasValues) ||
                   (token.Type == JTokenType.String && token.ToString() == String.Empty) ||
                   (token.Type == JTokenType.Null);
        }
    }
}
