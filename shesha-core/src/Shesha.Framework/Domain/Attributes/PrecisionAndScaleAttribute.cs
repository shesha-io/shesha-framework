using System;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Domain.Attributes
{
    /// <summary>
    /// The Precision class allows us to decorate our Entity Models with a Precision attribute 
    /// to specify decimal precision values for the database column
    /// </summary>
    [AttributeUsage(AttributeTargets.Property, AllowMultiple = false)]
    public class PrecisionAndScaleAttribute : RegularExpressionAttribute
    {
        /// <summary>
        /// The total number of digits to store, including decimals
        /// </summary>
        public byte Precision { get; set; }
        /// <summary>
        /// The number of digits from the precision to be used for decimals
        /// </summary>
        public byte Scale { get; set; }

        /// <summary>
        /// Define the precision and scale of a decimal data type
        /// </summary>
        /// <param name="precision">The total number of digits to store, including decimals</param>
        /// <param name="scale">The number of digits from the precision to be used for decimals</param>
        public PrecisionAndScaleAttribute(byte precision, byte scale) : base($@"^(0|-?\d{{0,{precision - scale}}}(\.\d{{0,{scale}}})?)$")
        {
            Precision = precision;
            Scale = scale;
        }

        // todo: apply validation, see https://stackoverflow.com/questions/19811180/best-data-annotation-for-a-decimal18-2
    }
}
