using Shesha.JsonEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain
{
    public class ImageAnnotationMark: JsonEntity
    {
        /// <summary>
        /// 
        /// </summary>
        public string Type { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public decimal X { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public decimal Y { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public decimal Width { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public decimal Height { get; set; }
    }
}
