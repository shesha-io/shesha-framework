using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;

namespace Shesha.GraphQL.Middleware
{
    /// <summary>
    /// GraphQL settings
    /// </summary>
    public class GraphQLSettings
    {
        public PathString Path { get; set; } = "/graphql";

        public Func<HttpContext, IDictionary<string, object>> BuildUserContext { get; set; }

        public bool EnableMetrics { get; set; }
    }
}
