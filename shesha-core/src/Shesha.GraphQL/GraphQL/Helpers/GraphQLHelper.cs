using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Shesha.GraphQL.Helpers
{
    public static class GraphQLHelper
    {
        /// <summary>
        /// Converts a GraphQL selection set string into a list of dot‑notated leaf field paths.
        /// </summary>
        /// <param name="selectionSet">The selection set string, e.g. "id module { id name } name".</param>
        /// <returns>A list of strings like "id", "module.id", "module.name", "name".</returns>
        public static List<string> GraphQLSelectionSetToDotNotation(string selectionSet)
        {
            var tokens = Tokenize(selectionSet);
            var (paths, _) = ParseSelectionSet(tokens, 0, string.Empty);
            return paths.Distinct().ToList();
        }

        private static List<string> Tokenize(string input)
        {
            var tokens = new List<string>();
            var current = new StringBuilder();

            foreach (char c in input)
            {
                // Treat commas as whitespace – they are optional in GraphQL.
                if (c == ',' || char.IsWhiteSpace(c))
                {
                    if (current.Length > 0)
                    {
                        tokens.Add(current.ToString());
                        current.Clear();
                    }
                }
                else if (c == '{' || c == '}')
                {
                    if (current.Length > 0)
                    {
                        tokens.Add(current.ToString());
                        current.Clear();
                    }
                    tokens.Add(c.ToString());
                }
                else
                {
                    current.Append(c);
                }
            }

            if (current.Length > 0)
            {
                tokens.Add(current.ToString());
            }

            return tokens;
        }

        private static (List<string> paths, int nextIndex) ParseSelectionSet(
            List<string> tokens, int start, string prefix)
        {
            var result = new List<string>();
            int i = start;

            while (i < tokens.Count)
            {
                string token = tokens[i];

                if (token == "}")
                {
                    // End of the current selection set
                    return (result, i + 1);
                }

                // token is a field name
                string fieldName = token;
                string fullPath = string.IsNullOrEmpty(prefix)
                    ? fieldName
                    : prefix + "." + fieldName;

                // Look ahead to see if this field has a nested selection set
                if (i + 1 < tokens.Count && tokens[i + 1] == "{")
                {
                    // Nested fields: consume the field name and the opening brace,
                    // then parse the inner set recursively.
                    var (nested, nextIdx) = ParseSelectionSet(tokens, i + 2, fullPath);
                    result.AddRange(nested);
                    i = nextIdx; // move to the token after the closing '}'
                }
                else
                {
                    // Leaf field
                    result.Add(fullPath);
                    i++;
                }
            }

            return (result, i);
        }
    }
}
