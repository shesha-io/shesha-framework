using System;
using System.Collections.Generic;

namespace Shesha.GraphQL.Dtos
{
    [Serializable]
    public class GraphQLExecutionInput
    {
        /// <summary>
        /// Operation name to execute.
        /// </summary>
        /// <example>Book</example>
        public string OperationName { get; set; }

        /// <summary>
        /// The query string.
        /// </summary>
        /// <example>query Book { book { name } }</example>
        public string Query { get; set; }

        /// <summary>
        /// A variables dictionary.
        /// </summary>
        /// <example>new({ {"filter", "Adult"} })</example>
        public Dictionary<string, object> Variables { get; set; }
    }
}
