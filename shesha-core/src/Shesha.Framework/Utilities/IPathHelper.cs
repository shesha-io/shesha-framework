namespace Shesha.Utilities
{
    /// <summary>
    ///  Path helper
    /// </summary>
    public interface IPathHelper
    {
        /// <summary>
        /// Performs similar function to Path.Combine() which combine multiple file path segments into
        /// a final path. Key differences are:
        /// - can handle path segments which are denoted as virtual paths i.e. starting with '~/'
        /// - removes the '/' at the start of any path segment so that it is treated as a path relative to the previous segments.
        /// </summary>
        string Combine(params string[] paths);

        /// <summary>
        /// Replaces any illegal character in a file name.
        /// </summary>
        /// <param name="fileName"></param>
        /// <returns></returns>
        string EscapeFilename(string fileName);

        /// <summary>
        /// Maps a virtual path to a physical one similar to HostingEnvironment.MapPath(path)
        /// but simply provides a fallback if application is running outside of a Web Hosting context.
        /// e.g. when running Unit Tests.
        /// </summary>
        /// <param name="path">Path to be mapped.</param>
        string MapVirtualPath(string path);
    }
}
