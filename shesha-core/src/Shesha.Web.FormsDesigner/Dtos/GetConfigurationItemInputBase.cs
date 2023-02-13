namespace Shesha.Web.FormsDesigner.Dtos
{
    /// <summary>
    /// Base class of the `get configuration item` input
    /// </summary>
    public class GetConfigurationItemInputBase
    {
        /// <summary>
        /// MD5 of the item. Is used for the client side caching.
        /// If specified, the application should compare the value received from the client with a local cache and return http response with code 304 (not changed)
        /// </summary>
        public string Md5 { get; set; }
    }
}
