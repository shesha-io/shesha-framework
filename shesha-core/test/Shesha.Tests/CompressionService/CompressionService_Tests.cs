using Shesha.Services;
using Shouldly;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Xunit;

namespace Shesha.Tests.CompressionHelper
{
    [Trait("RunOnPipeline", "yes")]
    public class CompressionServiceComplex_Tests
    {
        [Fact]
        public void Complex_Test()
        {
            var zipFileName = Path.GetTempFileName();

            var filesData = new Dictionary<string, string>()
            {
                { "file1.txt", "Lorem ipsum dolor sit amet"  },
                { "file2.txt", "Sed accumsan sodales nulla, a mattis nunc euismod sit amet. Proin varius nunc lectus, quis maximus ante mattis id"  }
            };

            var filesToCompress = new Dictionary<string, string>();
            foreach (var fd in filesData)
            {
                var path = Path.GetTempFileName();
                File.WriteAllText(path, fd.Value);
                filesToCompress.Add(fd.Key, path);

                CompressionService.IsZipFile(path).ShouldBe(false, $"{nameof(CompressionService.IsZipFile)} works wrong - recognized text file as a zip");
            }

            using (var zipStream = new FileStream(zipFileName, FileMode.Create))
            {
                CompressionService.CompressFilesToStream(filesToCompress, zipStream);
            }

            File.Exists(zipFileName).ShouldBe(true, "Failed to create zip file");

            CompressionService.IsZipFile(zipFileName).ShouldBe(true, "Created archive is not recognized as zip");

            foreach (var fileToCompress in filesToCompress)
            {
                File.Delete(fileToCompress.Value);
            }

            var extractPath = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
            var decompressedFiles = CompressionService.GetDecompressedFiles(zipFileName, extractPath);

            decompressedFiles.Count.ShouldBe(filesData.Count, "Wrong number of decompressed files");

            foreach (var fd in filesData)
            {
                var decompressedFile = decompressedFiles.FirstOrDefault(f => Path.GetFileName(f) == fd.Key);
                decompressedFile.ShouldNotBeNull($"File '{fd.Key}' not found");

                var text = File.ReadAllText(decompressedFile);
                text.ShouldBe(fd.Value, "Decompressed value doesn't match the initial one");
            }

            foreach (var file in decompressedFiles)
            {
                File.Delete(file);
            }
            File.Delete(zipFileName);
            Directory.Delete(extractPath);
        }
    }
}
