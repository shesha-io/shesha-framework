using System.IO;

namespace Shesha.Extensions
{
    public static class StreamExtensions
    {
        /// <summary>
        /// Copy stream to stream
        /// </summary>
        public static void CopyToStream(this Stream input, Stream output)
        {
            var buffer = new byte[32768];
            int r;
            while ((r = input.Read(buffer, 0, buffer.Length)) > 0)
                output.Write(buffer, 0, r);
        }

    }
}