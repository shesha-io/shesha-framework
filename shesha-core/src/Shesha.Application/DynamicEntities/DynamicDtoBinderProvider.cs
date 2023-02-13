using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;

namespace Shesha.DynamicEntities
{
    /// <summary>
    /// Dynamic DTO binder provider
    /// </summary>
    public class DynamicDtoBinderProvider : IModelBinderProvider
    {
        private readonly IList<IInputFormatter> _formatters;
        private readonly IHttpRequestStreamReaderFactory _readerFactory;
        private readonly ILoggerFactory _loggerFactory;
        private readonly MvcOptions? _options;
        private readonly IDynamicDtoTypeBuilder _dtoBuilder;

        /// <summary>
        /// Creates a new <see cref="DynamicDtoBinderProvider"/>.
        /// </summary>
        /// <param name="formatters">The list of <see cref="IInputFormatter"/>.</param>
        /// <param name="readerFactory">The <see cref="IHttpRequestStreamReaderFactory"/>.</param>
        /// <param name="loggerFactory">The <see cref="ILoggerFactory"/>.</param>
        /// <param name="options">The <see cref="MvcOptions"/>.</param>
        public DynamicDtoBinderProvider(
            IList<IInputFormatter> formatters,
            IHttpRequestStreamReaderFactory readerFactory,
            ILoggerFactory loggerFactory,
            MvcOptions? options,
            IDynamicDtoTypeBuilder dtoBuilder)
        {
            if (formatters == null)
            {
                throw new ArgumentNullException(nameof(formatters));
            }

            if (readerFactory == null)
            {
                throw new ArgumentNullException(nameof(readerFactory));
            }

            _formatters = formatters;
            _readerFactory = readerFactory;
            _loggerFactory = loggerFactory;
            _options = options;
            _dtoBuilder = dtoBuilder;
        }

        /// <inheritdoc />
        public IModelBinder? GetBinder(ModelBinderProviderContext context)
        {
            if (context == null)
            {
                throw new ArgumentNullException(nameof(context));
            }

            if (context.BindingInfo.BindingSource != null &&
                context.BindingInfo.BindingSource.CanAcceptDataFrom(BindingSource.Body) &&
                context.Metadata.ModelType.IsDynamicDto())
            {
                if (_formatters.Count == 0)
                {
                    throw new InvalidOperationException($"'{typeof(MvcOptions).FullName}.{nameof(MvcOptions.InputFormatters)}' must not be empty. At least one '{typeof(IInputFormatter).FullName}' is required to bind from the body.");
                }

                var treatEmptyInputAsDefaultValue = CalculateAllowEmptyBody(context.BindingInfo.EmptyBodyBehavior, _options);

                return new DynamicDtoModelBinder(_formatters, _readerFactory, _loggerFactory, _options, _dtoBuilder)
                {
                    AllowEmptyBody = treatEmptyInputAsDefaultValue,
                };
            }

            return null;
        }

        internal static bool CalculateAllowEmptyBody(EmptyBodyBehavior emptyBodyBehavior, MvcOptions? options)
        {
            if (emptyBodyBehavior == EmptyBodyBehavior.Default)
            {
                return options?.AllowEmptyInputInBodyModelBinding ?? false;
            }

            return emptyBodyBehavior == EmptyBodyBehavior.Allow;
        }
    }
}