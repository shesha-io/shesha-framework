using System;
using System.IO;

namespace Shesha.Utilities
{
    /// <summary>
    /// Creates a temporary folder and deletes it when disposed
    /// </summary>
    public sealed class TempFolder : IDisposable
    {
        public string Path { get; }

        public TempFolder()
        {
            Path = System.IO.Path.Combine(
                System.IO.Path.GetTempPath(),
                Guid.NewGuid().ToString()
            );
            Directory.CreateDirectory(Path);
        }

        public void Dispose()
        {
            try
            {
                if (Directory.Exists(Path))
                {
                    Directory.Delete(Path, true);
                }
            }
            catch
            {
                // Leave temp files for OS to clean up, don't throw in dispose
            }
        }
    }
}
