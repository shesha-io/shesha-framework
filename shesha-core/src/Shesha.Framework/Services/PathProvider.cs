using System.IO;
using Abp.Dependency;
using Microsoft.AspNetCore.Hosting;

namespace Shesha.Services
{
    /// <summary>
    /// Path provider, is used to map virtual paths
    /// </summary>
    public class PathProvider : IPathProvider, ITransientDependency
    {
        private readonly IWebHostEnvironment _hostingEnvironment;

        /// <summary>
        /// Default constructor
        /// </summary>
        /// <param name="environment"></param>
        public PathProvider(IWebHostEnvironment environment)
        {
            _hostingEnvironment = environment;
        }

        /// <summary>
        /// Map virtual path
        /// </summary>
        /// <param name="path"></param>
        /// <returns></returns>
        public string MapPath(string path)
        {
            var filePath = Path.Combine(_hostingEnvironment.WebRootPath, path);
            return filePath;
        }
    }
}