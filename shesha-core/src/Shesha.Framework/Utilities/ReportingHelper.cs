using Shesha.Exceptions;
using System.IO;
using System.Reflection;

namespace Shesha.Utilities
{
    public static class ReportingHelper
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
            var result = new MemoryStream();

            using (var resourceStream = assembly.GetEmbeddedResourceStream(resourceName)) 
            {
                var buffer = new byte[8 * 1024];
                int len;
                while ((len = resourceStream.Read(buffer, 0, buffer.Length)) > 0)
                {
                    result.Write(buffer, 0, len);
                }

                result.Position = 0;
            }

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

        /// <summary>
        /// Get embedded resource stream. Throws exception if stream not found
        /// </summary>
        /// <param name="assembly">Assembly containing embeddeed resource</param>
        /// <param name="resourceName">Resource name</param>
        /// <returns></returns>
        /// <exception cref="ManifestResourceStreamNotFoundException"></exception>
        public static Stream GetEmbeddedResourceStream(this Assembly assembly, string resourceName) 
        {
            var stream = assembly.GetManifestResourceStream(resourceName);
            if (stream == null)
                throw new ManifestResourceStreamNotFoundException(assembly, resourceName);

            return stream;            
        }
    }
}
