using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.Diagnostics;
using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;

namespace SheshaCodeAnalyzers
{
    [DiagnosticAnalyzer(LanguageNames.CSharp)]
    public class RestrictedStaticPropertyAnalyzer : DiagnosticAnalyzer
    {
        private static readonly ImmutableDictionary<string, string[]> RestrictedProperties =
            ImmutableDictionary.CreateRange(new[]
            {
                new KeyValuePair<string, string[]>("Abp.Dependency.IocManager", new[] { "Instance" }),
                //new KeyValuePair<string, string[]>("System.Environment", new[] { "CurrentDirectory", "ExitCode" }),
                //new KeyValuePair<string, string[]>("System.DateTime", new[] { "Now", "UtcNow" })
            });

        public const string DiagnosticId = "SHA001";
        private const string Category = "Usage";

        private static readonly LocalizableString Title = "Restricted static property access";
        private static readonly LocalizableString MessageFormat = "Usage of property '{1}' from static class '{0}' is not allowed";
        private static readonly LocalizableString Description = "Certain static properties are restricted from usage in this codebase.";

        private static readonly DiagnosticDescriptor Rule =
            new DiagnosticDescriptor(DiagnosticId, Title, MessageFormat, Category,
                DiagnosticSeverity.Error, isEnabledByDefault: true, description: Description);

        public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics =>
            ImmutableArray.Create(Rule);

        public override void Initialize(AnalysisContext context)
        {
            context.ConfigureGeneratedCodeAnalysis(GeneratedCodeAnalysisFlags.None);
            context.EnableConcurrentExecution();
            context.RegisterSyntaxNodeAction(AnalyzeMemberAccess, SyntaxKind.SimpleMemberAccessExpression);
        }

        private static void AnalyzeMemberAccess(SyntaxNodeAnalysisContext context)
        {
            var memberAccess = (MemberAccessExpressionSyntax)context.Node;

            if (!(memberAccess.Name is IdentifierNameSyntax propertyNameSyntax))
                return;

            var propertyName = propertyNameSyntax.Identifier.Text;
            var expression = memberAccess.Expression;
            var typeInfo = context.SemanticModel.GetTypeInfo(expression);

            if (typeInfo.Type == null)
                return;

            var fullTypeName = typeInfo.Type.ToDisplayString();

            if (!RestrictedProperties.TryGetValue(fullTypeName, out var restrictedProps))
                return;

            if (!restrictedProps.Contains(propertyName))
                return;

            var diagnostic = Diagnostic.Create(
                Rule,
                memberAccess.GetLocation(),
                fullTypeName,
                propertyName);

            context.ReportDiagnostic(diagnostic);
        }
    }
}
