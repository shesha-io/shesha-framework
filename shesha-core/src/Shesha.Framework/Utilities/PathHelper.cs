using System;
using System.IO;
using System.Reflection;
using Abp.Dependency;
using Microsoft.AspNetCore.Hosting;

namespace Shesha.Utilities
{
    /// <summary>
    /// Utility functions relating to file paths.
    /// </summary>
    public class PathHelper: IPathHelper, ITransientDependency
    {
        //private readonly IWebHostEnvironment _webHostEnvironment;

        /// <summary>
        /// Default constructor
        /// </summary>
        /// <param name="webHostEnvironment"></param>
        //public PathHelper(IWebHostEnvironment webHostEnvironment)
        //{
        //    _webHostEnvironment = webHostEnvironment;
        //}
        public IocManager IocManager { get; set; }

        /// <summary>
        /// Performs similar function to Path.Combine() which combine multiple file path segments into
        /// a final path. Key differences are:
        /// - can handle path segments which are denoted as virtual paths i.e. starting with '~/'
        /// - removes the '/' at the start of any path segment so that it is treated as a path relative to the previous segments.
        /// </summary>
        public string Combine(params string[] paths)
        {
            var modifiedPaths = new string[paths.Length];
            for (int i = 0; i < paths.Length; i++)
            {
                if (paths[i].StartsWith("~/"))
                {
                    modifiedPaths[i] = MapVirtualPath(paths[i]);
                }
                else
                {
                    modifiedPaths[i] = paths[i].TrimStart('/').TrimStart('\\');
                }
            }

            return Path.Combine(modifiedPaths);
        }

        /// <summary>
        /// Replaces any illegal character in a file name.
        /// </summary>
        /// <param name="fileName"></param>
        /// <returns></returns>
        public string EscapeFilename(string fileName)
        {
            char[] invalidChars = Path.GetInvalidFileNameChars();

            // Replace "%", then replace all other characters, then replace "."

            fileName = fileName.Replace("%", "%0025");
            foreach (char invalidChar in invalidChars)
            {
                fileName = fileName.Replace(invalidChar.ToString(), string.Format("%{0,4:X}", Convert.ToInt16(invalidChar)).Replace(' ', '0'));
            }
            return fileName.Replace(".", "%002E");
        }


        /// <summary>
        /// Maps a virtual path to a physical one similar to HostingEnvironment.MapPath(path)
        /// but simply provides a fallback if application is running outside of a Web Hosting context.
        /// e.g. when running Unit Tests.
        /// </summary>
        /// <param name="path">Path to be mapped.</param>
        public string MapVirtualPath(string path)
        {
            if (path.StartsWith("~"))
            {
                var env = IocManager.Resolve<IWebHostEnvironment>();

                var basePath = string.IsNullOrEmpty(env.ContentRootPath)
                    ? Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location) // Running outside Web Hosting context e.g. unit testing
                    : env.ContentRootPath;
                basePath = basePath.TrimEnd('\\').TrimEnd('/');

                path = path.TrimStart('~')
                    .Replace('\\', Path.DirectorySeparatorChar)
                    .Replace('/', Path.DirectorySeparatorChar)
                    .TrimStart(Path.DirectorySeparatorChar);
                return Path.Combine(basePath, path);
            }
            else
                return path;
        }
    }
}
