using System.Linq;
using System.Text;
using Shesha.Utilities;

namespace Shesha.CodeGeneration
{
    public class EnumsGenerator
    {
        public static string GenerateEnumItems(string source)
        {
            if (source == null)
                return null;

            var lines = source.Split('\r', '\n').Select(i => i.Trim()).Where(i => !string.IsNullOrWhiteSpace(i)).ToList();

            lines = lines.Distinct().OrderBy(i => i).ToList();

            var sb = new StringBuilder();
            var value = 0;
            foreach (var line in lines)
            {
                var identifier = line
                    .Replace(',', ' ')
                    .Replace('.', ' ')
                    .Replace('-', ' ')
                    .Replace('=', ' ')
                    .Replace('(', ' ')
                    .Replace(')', ' ')
                    .Replace('/', ' ')
                    .Replace('\\', ' ')
                    .RemoveDoubleSpaces()
                    .Split(' ', '\r', '\n')
                    .Select(i => i.CapitalizeFirstChar()).Delimited("");

                value++;
                sb.AppendLine(@$"[Description(""{line}"")]");
                sb.AppendLine(@$"{identifier} = {value},");
                sb.AppendLine("");
            }

            return sb.ToString();
        }
    }
}
