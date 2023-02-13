using Shesha.Domain.Attributes;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Shesha.Configuration.Runtime.Exceptions
{
    /// <summary>
    /// Duplicated TypeShortAlises exception
    /// </summary>
    public class DuplicatedTypeShortAliasesException: Exception
    {
        public Dictionary<string, IEnumerable<Type>> Duplicates { get; set; } = new Dictionary<string, IEnumerable<Type>>();

        public DuplicatedTypeShortAliasesException(Dictionary<string, IEnumerable<Type>> duplicates)
        {
            Duplicates = duplicates;
        }

        public override string Message => $"Duplicated {nameof(EntityAttribute.TypeShortAlias)} found: {Duplicates.Select(i => $"{i.Key}: { i.Value.Select(t => t.FullName) }").Delimited("; ")}";
    }
}
