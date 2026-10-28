namespace Shesha.Tests.DomainAttributes
{
    public class Address
    {
        public virtual string Street { get; set; }

        public virtual string Town { get; set; }

        public virtual int PostalCode { get; set; }

        /// <summary>
        /// Need to test nested objects
        /// </summary>
        public virtual GeometricCoordinates Coordinates { get; set; }
    }
}
