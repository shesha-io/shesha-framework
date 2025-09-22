using Shesha.Metadata.Dtos;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shesha.Configuration.Runtime.Exceptions
{
    /// <summary>
    /// Duplicate models exception
    /// </summary>
    public class DuplicateModelsException : Exception
    {
        public List<ModelDto> Duplicates { get; set; } = new List<ModelDto>();

        public DuplicateModelsException(List<ModelDto> duplicates) : base($"Found multiple models with the same {nameof(ModelDto.ClassName)} or {nameof(ModelDto.Alias)}")
        {
            Duplicates = duplicates;
        }

        private void AppendDetails(StringBuilder sb)
        {
            sb.AppendLine($"Duplicates ({Duplicates.Count} total):");
            for (int i = 0; i < Duplicates.Count; i++)
            {
                sb.AppendLine($"{i}#:   name: `{Duplicates[i].Name}`");
                sb.AppendLine($"        className: `{Duplicates[i].ClassName}`");
                sb.AppendLine($"        alias: `{Duplicates[i].Alias}`");
                sb.AppendLine($"        type: `{Duplicates[i].Type.FullName}`");
                sb.AppendLine($"        assembly: `{Duplicates[i].Type.Assembly.FullName}`");
            }
        }

        /// <summary>
        /// Creates and returns a string representation of the current exception
        /// </summary>
        /// <returns>A string representation of the current exception.</returns>
        public override string ToString()
        {
            var text = new StringBuilder();
            text.Append(base.ToString());

            text.AppendLine();
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
