using System;
using System.IO;
using System.Threading.Tasks;

namespace Shesha.BackgroundProcesses.Models
{
    /// <summary>
    /// Represents information about log file
    /// </summary>
    public class LogFileInfo
    {
        public string FileName { get; set; }
        public Func<Task<Stream>> StreamGetter { get; set; }
        public bool IsAvailable { get; set; }
        public static LogFileInfo Unavailable() => new() { IsAvailable = false };
        public static LogFileInfo Available(string fileName, Func<Task<Stream>> streamGetter) => new() { FileName = fileName, StreamGetter = streamGetter, IsAvailable = true };
    }
}
