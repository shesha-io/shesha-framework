using System;
using System.IO;
using System.Linq;
using System.Security.Cryptography;

namespace Shesha.Utilities
{
    /// <summary>
    /// Provides basic function for files handing
    /// </summary>
    public static class FileHelper
    {
        /// <summary>
        /// Cleans up a filename uploaded from the web application
        /// </summary>
        public static string CleanupFileName(this string fileName)
        {
            return fileName.Contains('\\')
                ? fileName.Split(new char[] { '\\' }).LastOrDefault()
                : fileName;
        }


        /// <summary>
        /// Returns MD5 hash of the specified <paramref name="fileName"/>
        /// </summary>
        public static string GetMD5(string fileName)
        {
            using (var md5 = MD5.Create())
            {
                using (var stream = File.OpenRead(fileName))
                {
                    return MD5ToString(md5.ComputeHash(stream));
                }
            }
        }

        /// <summary>
        /// Returns MD5 hash of the specified bytes
        /// </summary>
        public static string GetMD5(byte[] fileBytes)
        {
            using (var md5 = MD5.Create())
            {
                return MD5ToString(md5.ComputeHash(fileBytes));
            }
        }

        /// <summary>
        /// Returns MD5 hash of the specified stream
        /// </summary>
        public static string GetMD5(Stream stream)
        {
            var oldPosition = stream.Position;
            using (var md5 = MD5.Create())
            {
                var result = MD5ToString(md5.ComputeHash(stream));

                if (stream.CanSeek)
                    stream.Position = oldPosition;

                return result;
            }
        }

        private static string MD5ToString(byte[] bytes)
        {
            return BitConverter.ToString(bytes).Replace("-", "").ToLower();
        }
    }
}
