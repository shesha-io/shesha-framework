using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CodeActions;
using Microsoft.CodeAnalysis.CodeFixes;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using System;
using System.Collections.Immutable;
using System.Composition;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SheshaCodeAnalyzers
{
    [ExportCodeFixProvider(LanguageNames.CSharp, Name = nameof(RestrictedStaticPropertyCodeFixProvider)), Shared]
    public class RestrictedStaticPropertyCodeFixProvider : CodeFixProvider
    {
        public sealed override ImmutableArray<string> FixableDiagnosticIds =>
            ImmutableArray.Create(RestrictedStaticPropertyAnalyzer.DiagnosticId);

        public sealed override FixAllProvider GetFixAllProvider() => WellKnownFixAllProviders.BatchFixer;

        public sealed override async Task RegisterCodeFixesAsync(CodeFixContext context)
        {
            var root = await context.Document.GetSyntaxRootAsync(context.CancellationToken).ConfigureAwait(false);

            var diagnostic = context.Diagnostics[0];
            var diagnosticSpan = diagnostic.Location.SourceSpan;

            var memberAccess = root.FindNode(diagnosticSpan) as MemberAccessExpressionSyntax;
            if (memberAccess == null)
                return;

            context.RegisterCodeFix(
                new MyCodeAction(
                    "Replace with StaticContext usage",
                    c => RemoveRestrictedPropertyAccessAsync(context.Document, memberAccess, c)),
                diagnostic);
        }

        private async Task<Document> RemoveRestrictedPropertyAccessAsync(
            Document document,
            MemberAccessExpressionSyntax memberAccess,
            CancellationToken cancellationToken)
        {
            var root = await document.GetSyntaxRootAsync(cancellationToken).ConfigureAwait(false);

            // Replace the entire expression
            var newExpression = SyntaxFactory.ParseExpression("StaticContext.IocManager");
            var newRoot = root.ReplaceNode(memberAccess, newExpression);

            // Add both namespaces if needed
            newRoot = AddUsingIfMissing(newRoot, "Shesha.Services");
            
            return document.WithSyntaxRoot(newRoot);
        }

        private SyntaxNode AddUsingIfMissing(SyntaxNode root, string namespaceToAdd)
        {
            if (root is CompilationUnitSyntax compilationUnit)
            {
                if (!compilationUnit.Usings.Any(u => u.Name.ToString() == namespaceToAdd))
                {
                    var newUsing = SyntaxFactory.UsingDirective(
                        SyntaxFactory.ParseName(namespaceToAdd));

                    // Add to existing usings, keeping them sorted
                    var newUsings = compilationUnit.Usings.Add(newUsing)
                        .OrderBy(u => u.Name.ToString())
                        .ToList();

                    return compilationUnit.WithUsings(SyntaxFactory.List(newUsings));
                }
            }
            return root;
        }

        private class MyCodeAction : CodeAction
        {
            private readonly Func<CancellationToken, Task<Document>> _createChangedDocument;

            public MyCodeAction(string title, Func<CancellationToken, Task<Document>> createChangedDocument)
            {
                Title = title;
                _createChangedDocument = createChangedDocument;
            }

            public override string Title { get; }

            public override string EquivalenceKey => Title;

            protected override Task<Document> GetChangedDocumentAsync(CancellationToken cancellationToken)
            {
                return _createChangedDocument(cancellationToken);
            }
        }
    }
}