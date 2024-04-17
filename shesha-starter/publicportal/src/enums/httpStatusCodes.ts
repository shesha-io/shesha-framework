/**
 * See: https://www.w3schools.com/tags/ref_httpmessages.asp
 */
export enum HttpStatusCodes {
  // 1xx: Information
  Continue = 100, // The server has received the request headers, and the client should proceed to send the request body
  SwitchingProtocols = 101, // The requester has asked the server to switch protocols
  Checkpoint = 102, // Used in the resumable requests proposal to resume aborted PUT or POST requests

  // 2xx: Successful
  Ok = 200, // The request is OK (this is the standard response for successful HTTP requests)
  Created = 201, // The request has been fulfilled, and a new resource is created
  Accepted = 202, // The request has been accepted for processing, but the processing has not been completed
  NonAuthoritativeInformation = 203, // The request has been successfully processed, but is returning information that may be from another source
  NoContent = 204, // The request has been successfully processed, but is not returning any content
  ResetContent = 205, // The request has been successfully processed, but is not returning any content, and requires that the requester reset the document view
  PartialContent = 206, // The server is delivering only part of the resource due to a range header sent by the client

  // 3xx: Redirection
  MultipleChoices = 300, // A link list. The user can select a link and go to that location. Maximum five addresses
  MovedPermanently = 302, // The requested page has moved to a new URL
  Found = 303, // The requested page has moved temporarily to a new URL
  SeeOther = 304, // The requested page can be found under a different URL
  NotModified = 305, // Indicates the requested page has not been modified since last requested
  SwitchProxy = 306, // No longer used
  TemporaryRedirect = 307, // The requested page has moved temporarily to a new URL
  ResumeIncomplete = 308, // Used in the resumable requests proposal to resume aborted PUT or POST requests

  // 4xx: Client Error
  BadRequest = 400, // The request cannot be fulfilled due to bad syntax
  Unauthorized = 401, // The request was a legal request, but the server is refusing to respond to it. For use when authentication is possible but has failed or not yet been provided
  PaymentRequired = 402, // Reserved for future use
  Forbidden = 403, // The request was a legal request, but the server is refusing to respond to it
  NotFound = 404, // The requested page could not be found but may be available again in the future
  MethodNotAllowed = 405, // A request was made of a page using a request method not supported by that page
  NotAcceptable = 406, // The server can only generate a response that is not accepted by the client
  ProxyAuthenticationRequired = 407, // The client must first authenticate itself with the proxy
  RequestTimeout = 408, // The server timed out waiting for the request
  Conflict = 409, // The request could not be completed because of a conflict in the request
  Gone = 410, // The requested page is no longer available
  LengthRequired = 411, // The "Content-Length" is not defined. The server will not accept the request without it
  PreconditionFailed = 412, // The precondition given in the request evaluated to false by the server
  RequestEntityTooLarge = 413, // The server will not accept the request, because the request entity is too large
  RequestURITooLong = 414, // The server will not accept the request, because the URL is too long. Occurs when you convert a POST request to a GET request with a long query information
  UnsupportedMediaType = 415, // The server will not accept the request, because the media type is not supported
  RequestedRangeNotSatisfiable = 416, // The client has asked for a portion of the file, but the server cannot supply that portion
  ExpectationFailed = 417, // The server cannot meet the requirements of the Expect request-header field

  // 5xx: Server Error
  InternalServerError = 500, // A generic error message, given when no more specific message is suitable
  NotImplemented = 501, // The server either does not recognize the request method, or it lacks the ability to fulfill the request
  BadGateway = 502, // The server was acting as a gateway or proxy and received an invalid response from the upstream serve
  ServiceUnavailable = 503, // The server is currently unavailable (overloaded or down)
  GatewayTimeout = 504, // The server was acting as a gateway or proxy and did not receive a timely response from the upstream server
  HTTPVersionNotSupported = 505, // 	The server does not support the HTTP protocol version used in the request
  NetworkAuthenticationRequired = 511, // The client needs to authenticate to gain network access
}
