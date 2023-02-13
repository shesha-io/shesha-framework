using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Mail;
using System.Text.RegularExpressions;
using Abp.Dependency;
using MimeTypes;
using Shesha.Utilities;

namespace Shesha.Email
{
    /// <summary>
    /// inheritedDoc
    /// </summary>
    public class EmailImagesHelper : IEmailImagesHelper, ITransientDependency
    {
        /// <summary>
        /// inheritedDoc
        /// </summary>
        public bool PrepareImages(MailMessage message)
        {
            if (!message.IsBodyHtml)
                return false;

            var images = new List<InlineImage>();
            // regular expression to extract Urls for img tags
            var imgRegex =
                new Regex(@"(?<=img\s+[\w\s\""\'\=\:\;\\\/\.]*src\=[\x27\x22])(?<Url>[^\x27\x22]*)(?=[\x27\x22])");
            var imgIndex = 0;

            // replace Urls in <img> tags
            var newBody = imgRegex.Replace(message.Body, m =>
            {
                var res = m.Value;

                var embeddedImgRegex = new Regex(@"data:(?<contentType>image/[\w]+);base64,");
                var embeddedMatches = embeddedImgRegex.Match(res);

                if (embeddedMatches.Success)
                {
                    var contentType = embeddedMatches.Groups["contentType"].Value;
                    var imageBase64 = embeddedImgRegex.Replace(res, "");
                    var imageBytes = Convert.FromBase64String(imageBase64);

                    var tmp = Path.ChangeExtension(Path.GetTempFileName(), MimeTypeMap.GetExtension(contentType));

                    using (var imageFile = new FileStream(tmp, FileMode.Create))
                    {
                        imageFile.Write(imageBytes, 0, imageBytes.Length);
                        imageFile.Flush();
                    }

                    var image = new InlineImage
                    {
                        FilePath = tmp,
                        Name = $"image{imgIndex++}",
                        ContentType = contentType
                    };
                    images.Add(image);
                    res = "cid:" + image.Name;
                }
                
                return res;
            });

            message.Body = newBody;
            var htmlView = AlternateView.CreateAlternateViewFromString(newBody, null, "text/html");

            foreach (var image in images)
            {
                var res = new LinkedResource(image.FilePath, image.ContentType)
                {
                    ContentId = image.Name
                };
                htmlView.LinkedResources.Add(res);
            }

            message.AlternateViews.Add(htmlView);
            message.IsBodyHtml = true;

            return true;
        }

        private static string CopySizeFromStyle(string html)
        {
            var imgRegex = new Regex(@"<img(.*)\/>|<img(.*)</img>");
            var styleRegex = new Regex(@"(?<=\bstyle="")[^""]*");
            var widthRegex = new Regex(@"(?<=\bwidth="")[^ ""]*");
            var heightRegex = new Regex(@"(?<=\bheight="")[^ ""]*");

            var newHtml = imgRegex.Replace(html, m =>
            {
                var res = m.Value;

                var widthMatch = widthRegex.Match(m.Value);
                var heightMatch = heightRegex.Match(m.Value);
                var styleMatch = styleRegex.Match(m.Value);
                if (styleMatch.Success)
                {
                    var style = styleMatch.Value;

                    if (!widthMatch.Success)
                    {
                        var styleWidth = new Regex(@"(?<=\bwidth:)[^;""]*").Match(style);
                        if (styleWidth.Success)
                        {
                            res = styleRegex.Replace(res, mm => mm.Value + $"\" width=\"{styleWidth.Value.RemovePostfix("px")}");
                        }
                    }
                    if (!heightMatch.Success)
                    {
                        var styleHeight = new Regex(@"(?<=\bheight:)[^;""]*").Match(style);
                        if (styleHeight.Success)
                        {
                            res = styleRegex.Replace(res, mm => mm.Value + $"\" height=\"{styleHeight.Value.RemovePostfix("px")}");
                        }
                    }
                }

                return res;
            });

            return newHtml;

        }

        /// <summary>
        /// inheritedDoc
        /// </summary>
        public string LocalImagesToEmbedded(string html)
        {
            // todo: convert to use in Shesha 3 and uncomment
            throw new NotImplementedException();
            /*
            var imgRegex = new Regex(@"(?<=img\s+[\w\s\""\'\=\:\;\\\/\.]*src\=[\x27\x22])(?<Url>[^\x27\x22]*)(?=[\x27\x22])");
            var newHtml = imgRegex.Replace(html, m =>
            {
                var res = m.Value;

                var fileName = string.Empty;

                if (res.TrimStart('/').StartsWith("fileManager", StringComparison.InvariantCultureIgnoreCase))
                {
                    // path
                    var decoded = HttpUtility.UrlDecode(HttpUtility.HtmlDecode(res));
                    var queryParams = HttpUtility.ParseQueryString(decoded);
                    fileName = (queryParams["path"] ?? "").Replace('/', '\\').TrimStart('\\');
                }
                else
                {
                    var storedFileUrlRegex = new Regex(@"/StoredFile/Get/(?'fileId'[\d]+)");
                    var match = storedFileUrlRegex.Match(m.Value);
                    if (match.Success)
                    {
                        var id = match.Groups["fileId"].Value?.ToGuid();
                        if (id.HasValue && id != Guid.Empty)
                        {
                            var fileRepository = StaticContext.IocManager.Resolve<IRepository<StoredFile, Guid>>();
                            fileName = fileRepository.Get(id.Value)?.PhysicalFilePath();
                        }
                    }
                }

                if (!string.IsNullOrWhiteSpace(fileName))
                {
                    var settings = StaticContext.IocManager.Resolve<ISheshaSettings>();
                    var imagesPhysicalPath = Path.Combine(settings.UploadFolder, "UserFiles");
                    var imagesDir = new DirectoryInfo(imagesPhysicalPath);
                    if (!imagesDir.Exists)
                        imagesDir.Create();
                    var fullFileName = Path.Combine(imagesDir.FullName, fileName);

                    if (!File.Exists(fullFileName))
                        return res;

                    var mimeMapper = StaticContext.IocManager.Resolve<IMimeMappingService>();

                    var base64Img = new Base64Image
                    {
                        FileContents = File.ReadAllBytes(fullFileName),
                        ContentType = mimeMapper.Map(fullFileName)
                    };

                    var base64EncodedImg = base64Img.ToString();
                    res = base64EncodedImg;
                }

                return res;
            });

            return newHtml;
            */
        }

        // todo: remove, it's a copy of the same method from the FileHelper
        private class InlineImage
        {
            public string FilePath { get; set; }
            public string Name { get; set; }
            public string ContentType { get; set; }
        }
    }

    public class Base64Image
    {
        public static Base64Image Parse(string base64Content)
        {
            if (string.IsNullOrEmpty(base64Content))
            {
                throw new ArgumentNullException(nameof(base64Content));
            }

            int indexOfSemiColon = base64Content.IndexOf(";", StringComparison.OrdinalIgnoreCase);

            string dataLabel = base64Content.Substring(0, indexOfSemiColon);

            string contentType = dataLabel.Split(':').Last();

            var startIndex = base64Content.IndexOf("base64,", StringComparison.OrdinalIgnoreCase) + 7;

            var fileContents = base64Content.Substring(startIndex);

            var bytes = Convert.FromBase64String(fileContents);

            return new Base64Image
            {
                ContentType = contentType,
                FileContents = bytes
            };
        }

        public string ContentType { get; set; }

        public byte[] FileContents { get; set; }

        public override string ToString()
        {
            return $"data:{ContentType};base64,{Convert.ToBase64String(FileContents)}";
        }
    }
}