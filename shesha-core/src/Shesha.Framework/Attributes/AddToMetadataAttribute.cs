using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Attributes
{
    /// <summary>
    /// This class will be used in MetadataAppSerice
    /// </summary>
    [AttributeUsage(AttributeTargets.Class)]
    public class AddToMetadataAttribute: Attribute
    {
        public AddToMetadataAttribute() 
        { 
        }
    }
}
