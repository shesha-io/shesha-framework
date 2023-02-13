using System;
using System.IO;
using System.Runtime.Serialization.Formatters.Binary;
using System.Text;
using System.Xml.Serialization;

namespace Shesha.Utilities
{
    /// <summary>
    /// Helper class with serialization related methods.
    /// </summary>
    public class SerializationHelper
    {
        /// <summary>
        /// Serializes specified <paramref name="obj"/> to Base64
        /// </summary>
        public static string SerializeBase64(object obj)
        {
            // Serialize to a base 64 string
            byte[] bytes;
            
            using (var ws = new MemoryStream())
            {
                var sf = new BinaryFormatter();
                sf.Serialize(ws, obj);
                
                bytes = ws.GetBuffer();
                return bytes.Length + ":" + Convert.ToBase64String(bytes, 0, bytes.Length, Base64FormattingOptions.None);
            }
        }

        /// <summary>
        /// Deserializes object from Base64
        /// </summary>
        public static object DeserializeBase64(string s)
        {
            // We need to know the exact length of the string - Base64 can sometimes pad us by a byte or two
            int p = s.IndexOf(':');
            int length = Convert.ToInt32(s.Substring(0, p));

            // Extract data from the base 64 string!
            byte[] memoryData = Convert.FromBase64String(s.Substring(p + 1));

            using (var rs = new MemoryStream(memoryData, 0, length))
            {
                var sf = new BinaryFormatter();
                return sf.Deserialize(rs);
            }
        }

        /// <summary>
        /// Deserializes specified <paramref name="xml"/> to an object of type <typeparamref name="T"/>
        /// </summary>
        public static T DeserializeXml<T>(string xml)
        {
            // Deserializing the Xml to the settings object.
            if (string.IsNullOrWhiteSpace(xml))
                return default(T);

            var deserializer = new XmlSerializer(typeof(T));

            using (var textReader = new StringReader(xml))
            {
                var deserialized = (T)deserializer.Deserialize(textReader);
                textReader.Close();

                return deserialized;
            }
        }

        /// <summary>
        /// Serializes specified <paramref name="obj"/> to XML
        /// </summary>
        public static string SerializeToXml(object obj)
        {
            var sb = new StringBuilder();

            var serializer = new XmlSerializer(obj.GetType());

            using (var textWriter = new StringWriter(sb))
            {
                serializer.Serialize(textWriter, obj);
                textWriter.Flush();
                textWriter.Close();

                return sb.ToString();
            }
        }
    }
}
