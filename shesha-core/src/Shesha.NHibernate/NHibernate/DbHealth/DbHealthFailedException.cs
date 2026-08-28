using System;
using System.Collections.Generic;
using System.Text;

namespace Shesha.NHibernate.DbHealth
{
    /// <summary>
    /// DB Health check failed exception
    /// </summary>
    public class DbHealthFailedException: Exception
    {
        public List<string> Issues { get; private set; }

        public DbHealthFailedException(List<string> issues): base("Database health check failed")
        {
            Issues = issues;
        }

        private void AppendDetails(StringBuilder sb)
        {
            sb.AppendLine($"Issues ({Issues.Count} total):");
            for (int i = 0; i < Issues.Count; i++)
            {
                sb.AppendLine($"{i}#: `{Issues[i]}`");
            }
        }

        /// <summary>
        /// Creates and returns a string representation of the current exception
        /// </summary>
        /// <returns>A string representation of the current exception.</returns>
        public override string ToString()
        {
            var text = new StringBuilder();
            
            AppendDetails(text);

            return text.ToString();
        }

        /// <summary>Gets a message that describes the exception.</summary>
        public override string Message
        {
            get
            {
                var sb = new StringBuilder();
                sb.Append(base.Message);
                sb.AppendLine();
                AppendDetails(sb);

                return sb.ToString();
            }
        }
    }
}
