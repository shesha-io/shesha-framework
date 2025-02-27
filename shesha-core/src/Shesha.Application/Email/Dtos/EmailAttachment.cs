using System;
using System.IO;

namespace Shesha.Email.Dtos
{
    /// <summary>
    /// Email attachment
    /// </summary>
    public class EmailAttachment: IDisposable
    {
        public string FileName { get; set; }
        public Stream Stream { get; set; }

        public EmailAttachment(string fileName, Stream stream)
        {
            FileName = fileName;
            Stream = stream;
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
#pragma warning disable IDISP007 // Don't dispose injected
            if (disposing)
                Stream?.Dispose();
#pragma warning restore IDISP007 // Don't dispose injected            
        }
    }
}
