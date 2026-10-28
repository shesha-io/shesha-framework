using Abp.Domain.Entities;
using Shesha.Domain.Attributes;
using Shesha.JsonEntities;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain
{
    [Entity(TypeShortAlias = "SheshaFunctionalTests.ImageAnnotation")]
    public class ImageAnnotation: JsonEntity
    {
        /// <summary>
        /// 
        /// </summary>
        public string Id { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public string Comment { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public ImageAnnotationMark Mark { get; set; }
    }
}
