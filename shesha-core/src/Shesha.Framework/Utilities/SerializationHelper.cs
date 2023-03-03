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
