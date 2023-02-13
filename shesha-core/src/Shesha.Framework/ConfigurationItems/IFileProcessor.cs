using System.IO;

namespace Shesha.ConfigurationItems
{

    /// <summary>
    /// File processor
    /// </summary>
    public interface IFileProcessor
    {
        /// <summary>
        /// Name of the file processor
        /// </summary>
        string Name { get; }

        /// <summary>
        /// Description of the file processor
        /// </summary>
        string Description { get; }

        /// <summary>
        /// Returns true if the current file processor supports processing of file with specified <paramref name="fileName"/>
        /// </summary>
        /// <param name="fileName">File name</param>
        /// <returns></returns>
        bool CanProcessFileName(string fileName);

        /// <summary>
        /// Returns true if the current file processor can process specified file content
        /// </summary>
        /// <param name="stream"></param>
        /// <returns></returns>
        bool CanProcessFileContent(Stream stream);
    }
}
