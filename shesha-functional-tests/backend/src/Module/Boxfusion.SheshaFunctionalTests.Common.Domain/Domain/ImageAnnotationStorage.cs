using Shesha.JsonEntities;
using System.Collections.Generic;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain
{
    public class ImageAnnotationStorage : JsonEntity
    {
        /// <summary>
        /// 
        /// </summary>
        public string Url { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public string Bit64Url { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public virtual IList<ImageAnnotation> Data { get; set; }
    }
}
