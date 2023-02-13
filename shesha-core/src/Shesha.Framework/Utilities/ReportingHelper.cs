using System.IO;
using System.Reflection;

namespace Shesha.Utilities
{
    public class ReportingHelper
    {
        public static MemoryStream GetResourceStream(string resourceName)
        {
            return GetResourceStream(resourceName, Assembly.GetExecutingAssembly());
        }

        /// <summary>
        /// Returns content of the embedded resource as MemoryStream
        /// </summary>
        /// <param name="resourceName">Name of the resource</param>
        /// <param name="assembly">Assembly that contains a resource</param>
        /// <returns></returns>
        public static MemoryStream GetResourceStream(string resourceName, Assembly assembly)
        {
            var resourceStream = assembly.GetManifestResourceStream(resourceName);

            var result = new MemoryStream();

            var buffer = new byte[8 * 1024];
            int len;
            while ((len = resourceStream.Read(buffer, 0, buffer.Length)) > 0)
            {
                result.Write(buffer, 0, len);
            }

            result.Position = 0;

            return result;
        }

        /// <summary>
        /// Returns string content of the embedded resource
        /// </summary>
        /// <param name="resourceName">Name of the resource</param>
        /// <param name="assembly">Assembly that contains a resource</param>
        /// <returns></returns>
        public static string GetResourceString(string resourceName, Assembly assembly)
        {
            var stream = GetResourceStream(resourceName, assembly);
            using (var sr = new StreamReader(stream))
            {
                return sr.ReadToEnd();
            }
        }
    }
}
