using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.Testing;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Linq;
using System.Threading.Tasks;
using VerifyCS = SheshaCodeAnalyzers.Test.CSharpCodeFixVerifier<
    SheshaCodeAnalyzers.RestrictedStaticPropertyAnalyzer,
    SheshaCodeAnalyzers.RestrictedStaticPropertyCodeFixProvider>;

namespace SheshaCodeAnalyzers.Test
{
    [TestClass]
    public class SheshaCodeAnalyzersUnitTest
    {
        //No diagnostics expected to show up
        [TestMethod]
        public async Task TestMethod1()
        {
            var test = @"";

            await VerifyCS.VerifyAnalyzerAsync(test);
        }

        //Diagnostic and CodeFix both triggered and checked for
        [TestMethod]
        public async Task TestMethod2()
        {
            const string testCode = @"
using System;
using Abp.Dependency;

class TestClass
{
    void TestMethod()
    {
        var repository = {|#0:IocManager.Instance|}.Resolve<IRepository>();
        var time = {|#1:DateTime.Now|};
    }
}";
            var expectedValidation = VerifyCS.Diagnostic(RestrictedStaticPropertyAnalyzer.DiagnosticId)
                .WithLocation(0)
                .WithArguments("Abp.Dependency.IocManager", "Instance");
            await VerifyCS.VerifyAnalyzerAsync(testCode, expectedValidation);


            var test = @"
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Threading.Tasks;
    using System.Diagnostics;

    namespace ConsoleApplication1
    {
        class {|#0:TypeName|}
        {   
        }
    }";

            var fixtest = @"
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Threading.Tasks;
    using System.Diagnostics;

    namespace ConsoleApplication1
    {
        class TYPENAME
        {   
        }
    }";

            var expected = VerifyCS.Diagnostic(RestrictedStaticPropertyAnalyzer.DiagnosticId).WithLocation(0).WithArguments("TypeName");

            await VerifyCS.VerifyCodeFixAsync(test, expected, fixtest);
        }

        [TestMethod]
        public async Task TestAnalyzer()
        {
            const string testCode = @"
using System;
using Abp.Dependency;

public interface IRepository 
{
}

class TestClass
{
    void TestMethod()
    {
        var repository = {|#0:IocManager.Instance|}.Resolve<IRepository>();
    }
}";

            const string fixedCode = @"using Abp.Dependency;
using Shesha.Services;
using System;

public interface IRepository 
{
}

class TestClass
{
    void TestMethod()
    {
        var repository = StaticContext.IocManager.Resolve<IRepository>();
    }
}";

            const string abpCode = @"
using System;

namespace Abp.Dependency {
    public class IocManager {
        public static IocManager Instance;
        public T Resolve<T>()
        {
            throw new NotImplementedException();
        }
    }
}
";
            const string shaCode = @"
using System;
using Abp.Dependency;

namespace Shesha.Services {
    public static class StaticContext {
        public static IocManager IocManager;
    }
}
";

            var expected = VerifyCS.Diagnostic(RestrictedStaticPropertyAnalyzer.DiagnosticId).WithLocation(0).WithArguments("Abp.Dependency.IocManager", "Instance");

            var testAnalyze = new VerifyCS.Test
            {
                TestState = { 
                    Sources = { testCode, abpCode, shaCode },
                },
                FixedState = { 
                    Sources = { fixedCode, abpCode, shaCode }
                },
                // Disable automatic verification
                TestBehaviors = TestBehaviors.SkipGeneratedCodeCheck | TestBehaviors.SkipSuppressionCheck,
                CodeFixTestBehaviors = CodeFixTestBehaviors.SkipFixAllCheck

            };
            testAnalyze.TestState.ExpectedDiagnostics.Add(expected);

            // Need to store the solution outside the event handler
            Solution fixedSolution = null;

            // Register a callback for when fixes are computed
            testAnalyze.SolutionTransforms.Add((solution, projectId) =>
            {
                fixedSolution = solution;
                return solution; // Return unchanged
            });

            try
            {
                await testAnalyze.RunAsync();
            }
            catch 
            {
                throw;
            }
            
            // Assert
            Assert.IsNotNull(fixedSolution);

            var doc = testAnalyze.TestState.Sources.First();
            var fixedDocument = fixedSolution.GetDocumentIdsWithFilePath(doc.filename);

            var docId = fixedDocument.First();
            var fixedDoc = fixedSolution.GetDocument(docId);
            var fixedText = await fixedDoc.GetTextAsync();            
        }
    }    
}
