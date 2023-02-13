using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Threading.Tasks;
using Abp.Dependency;
using Shesha.Domain;

namespace Shesha.Services
{
    public class CompressionService
    {
        public static byte[] CompressFiles(Dictionary<string, string> files)
        {
            using (var ms = new MemoryStream())
            {
                CompressFilesToStream(files, ms);
                return  ms.ToArray();
            }
        }

        public static async Task<Stream> CompressFiles(Dictionary<string, StoredFile> files)
        {
            var ms = new MemoryStream();
            await CompressFilesToStream(files, ms);
            ms.Seek(0, SeekOrigin.Begin);
            return ms;
        }

        /// <summary>
        /// Compress files to stream
        /// </summary>
        /// <param name="files">Dictionary of files. Key - file name, Value - file path</param>
        /// <param name="stream">zip stream</param>
        public static void CompressFilesToStream(Dictionary<string, string> files, Stream stream)
        {
            using (var zip = new ZipArchive(stream, ZipArchiveMode.Create, leaveOpen: true))
            {
                foreach (var fileToZip in files)
                {
                    using (var fileData = new FileStream(fileToZip.Value, FileMode.Open))
                    {
                        var entry = zip.CreateEntry(fileToZip.Key);

                        using (var dstStream = entry.Open())
                        {
                            fileData.CopyTo(dstStream);
                        }
                    }
                }
            }
        }

        public static async Task CompressFilesToStream(Dictionary<string, StoredFile> files, Stream stream)
        {
            var fileService = StaticContext.IocManager.Resolve<IStoredFileService>();

            using (var zip = new ZipArchive(stream, ZipArchiveMode.Create, leaveOpen: true))
            {
                foreach (var fileToZip in files)
                {
                    var entry = zip.CreateEntry(fileToZip.Key);
                    
                    await using (var fileStream = await fileService.GetStreamAsync(fileToZip.Value))
                    {
                        using (var dstStream = entry.Open())
                        {
                            await fileStream.CopyToAsync(dstStream);
                        }
                    }
                }
            }
        }

        public static List<string> GetDecompressedFiles(string zipPath, string extractPath)
        {
            if (!Directory.Exists(extractPath))
                Directory.CreateDirectory(extractPath);

            var files = new List<string>();

            using (var archive = ZipFile.OpenRead(zipPath))
            {
                foreach (var entry in archive.Entries)
                {
                    // Gets the full path to ensure that relative segments are removed.
                    string destinationPath = Path.GetFullPath(Path.Combine(extractPath, entry.FullName));

                    // Ordinal match is safest, case-sensitive volumes can be mounted within volumes that
                    // are case-insensitive.
                    if (destinationPath.StartsWith(extractPath, StringComparison.Ordinal))
                    {
                        entry.ExtractToFile(destinationPath);
                        files.Add(destinationPath);
                    }
                }
            }
            return files;
        }

        public static bool IsZipFile(string fileName)
        {
            try
            {
                using var zip = ZipFile.OpenRead(fileName);
                return true;
            }
            catch (InvalidDataException)
            {
                return false;
            }
        }
    }
}
