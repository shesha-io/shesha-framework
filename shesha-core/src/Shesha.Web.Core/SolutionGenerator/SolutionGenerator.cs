using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.IO.Pipelines;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Abp.Dependency;
using Shesha.Utilities;

namespace Shesha.Tests.SolutionGenerator
{
    public class SolutionGenerator: ISolutionGenerator, ITransientDependency
    {
        private List<string> _sourceFileExtensions = new List<string> { ".cs", ".csproj", ".sln", ".xml", ".json" };
        public async Task GenerateAsync(
                string sourcePath, 
                string destination, 
                Dictionary<string, string> tags,
                Func<string, bool> includePathCondition,
                CancellationToken cancellationToken)
        {
            var files = new Dictionary<string, string>();
            FillFilesListRecursive(sourcePath, sourcePath, includePathCondition, files, tags, cancellationToken);

            using (var zipStream = new FileStream(destination, FileMode.Create))
            {
                using (var zip = new ZipArchive(zipStream, ZipArchiveMode.Create, leaveOpen: true))
                {
                    foreach (var file in files)
                    {
                        cancellationToken.ThrowIfCancellationRequested();

                        var entry = zip.CreateEntry(file.Value);

                        using (var dstStream = entry.Open())
                        {
                            await PrepareFileAndCopyAsync(file.Key, dstStream, tags, cancellationToken);
                        }
                    }
                }
            }
        }

        private async Task PrepareFileAndCopyAsync(string path, Stream dstStream, Dictionary<string, string> tags, CancellationToken cancellationToken)
        {
            var extension = Path.GetExtension(path)?.ToLower();
            if (_sourceFileExtensions.Contains(extension))
            {
                using (var sr = new StreamReader(path))
                {
                    using (var sw = new StreamWriter(dstStream))
                    {
                        while (!sr.EndOfStream) 
                        {
                            var line = await sr.ReadLineAsync();
                            var newLine = line.ReplaceTags(tags);
                            await sw.WriteLineAsync(newLine);
                        }
                    }
                }
            }
            else {
                using (var fs = new FileStream(path, FileMode.Open))
                {
                    await fs.CopyToAsync(dstStream, cancellationToken);
                }
            }
        }

        private void FillFilesListRecursive(string basePath, string directory, Func<string, bool> includePathCondition, Dictionary<string, string> filesDictionary, Dictionary<string, string> tags, CancellationToken cancellationToken)
        {
            var files = Directory.GetFiles(directory);
            foreach (var file in files)
            {
                cancellationToken.ThrowIfCancellationRequested();
                var relativePath = file.RemovePrefix(basePath);
                if (!includePathCondition.Invoke(relativePath))
                    continue;

                var dstRelativePath = relativePath.ReplaceTags(tags);
                filesDictionary.Add(file, dstRelativePath);
            }

            var directories = Directory.GetDirectories(directory);
            foreach (var dir in directories)
            {
                cancellationToken.ThrowIfCancellationRequested();

                if (!includePathCondition.Invoke(dir))
                    continue;

                FillFilesListRecursive(basePath, dir, includePathCondition, filesDictionary, tags, cancellationToken);
            }
        }
    }
}
