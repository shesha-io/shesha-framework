using Newtonsoft.Json.Linq;
using System;

namespace Shesha.JsonLogic.Exceptions
{
    /// <summary>
    /// Indicates problems during JsonLogic parsing
    /// </summary>
    public class JsonLogicParsingFailedException: Exception
    {
        /// <summary>
        /// Expression whose parsing has failed
        /// </summary>
        public JToken Expression { get; private set; }

        public JsonLogicParsingFailedException(string message, JToken expression) : base(message)
        {
            Expression = expression;
        }
    }
}
