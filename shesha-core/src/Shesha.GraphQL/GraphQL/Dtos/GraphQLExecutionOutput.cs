using System;
using System.Collections.Generic;

namespace Shesha.GraphQL.Dtos
{
    [Serializable]
    public class GraphQLExecutionOutput : Dictionary<string, object>
    {
        public GraphQLExecutionOutput()
        {

        }

        public GraphQLExecutionOutput(IDictionary<string, object> dictionary) : base(dictionary)
        {
        }
    }
}
