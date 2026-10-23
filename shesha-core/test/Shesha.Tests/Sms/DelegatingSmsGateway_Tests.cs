using Abp.Dependency;
using Abp.Reflection;
using Castle.MicroKernel.Registration;
using Castle.Windsor;
using Moq;
using Shesha.Attributes;
using Shesha.Notifications.Dto;
using Shesha.Settings;
using Shesha.Sms;
using Shesha.Sms.Configuration;
using Shouldly;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.Sms
{
    /// <summary>
    /// Container registration of <see cref="ISmsGateway"/> must not block a thread or touch settings.
    /// Mirrors <c>SheshaApplicationModule</c>, which registers <see cref="DelegatingSmsGateway"/>.
    /// </summary>
    public sealed class DelegatingSmsGateway_Tests : IDisposable
    {
        public DelegatingSmsGateway_Tests()
        {
            SmsGatewayFactory.ClearGatewayTypeCache();
        }

        public void Dispose()
        {
            SmsGatewayFactory.ClearGatewayTypeCache();
        }

        [Fact]
        public void Resolve_DoesNotCallFactoryOrReadSettings_Test()
        {
            var factory = new Mock<ISmsGatewayFactory>(MockBehavior.Strict);
            var settings = new Mock<ISmsSettings>(MockBehavior.Strict);

            using var container = new WindsorContainer();
#pragma warning disable IDISP004 // Register returns this container for fluent chaining
            container.Register(
                Component.For<ISmsGatewayFactory>().Instance(factory.Object),
                Component.For<ISmsSettings>().Instance(settings.Object),
                Component.For<ISmsGateway>().ImplementedBy<DelegatingSmsGateway>().LifestyleTransient());
#pragma warning restore IDISP004

            for (var i = 0; i < 8; i++)
            {
                var gateway = container.Resolve<ISmsGateway>();
                gateway.ShouldBeOfType<DelegatingSmsGateway>();
                gateway.SettingsType.ShouldBeNull();
                container.Release(gateway);
            }
        }

        [Fact]
        public async Task Send_UsesCurrentlyConfiguredGateway_AndSwitchesWhenSettingChanges_TestAsync()
        {
            var gatewayA = new GatewayA();
            var gatewayB = new GatewayB();
            var current = new SmsSettings { SmsGateway = GatewayA.Uid };
            using var setup = new FactorySetup(() => Task.FromResult(current), gatewayA, gatewayB);
            var delegating = new DelegatingSmsGateway(setup.Factory);

            delegating.SettingsType.ShouldBeNull();
            setup.SettingsReads.ShouldBe(0);
            setup.Scans.ShouldBe(0);

            var first = await delegating.SendSmsAsync("0820000000", "one");
            first.IsSuccess.ShouldBeTrue();
            first.Message.ShouldBe("gateway-a");
            gatewayA.Sent.ToArray().ShouldBe(new[] { "one" });
            gatewayB.Sent.ShouldBeEmpty();
            delegating.SettingsType.ShouldBe(typeof(GatewayASettings));

            var readsAfterTypeLookup = setup.SettingsReads;
            delegating.SettingsType.ShouldBe(typeof(GatewayASettings));
            setup.SettingsReads.ShouldBe(readsAfterTypeLookup);
            setup.Scans.ShouldBe(1);

            current.SmsGateway = GatewayB.Uid;

            var second = await delegating.SendSmsAsync("0820000000", "two");
            second.Message.ShouldBe("gateway-b");
            gatewayB.Sent.ToArray().ShouldBe(new[] { "two" });
            delegating.SettingsType.ShouldBe(typeof(GatewayBSettings));
            setup.Scans.ShouldBe(1);
            setup.SettingsReads.ShouldBe(2);

            (await delegating.GetSettingsAsync()).ShouldBeSameAs(gatewayB.Marker);
            await delegating.SetSettingsAsync(new GatewayBSettings());
            gatewayB.SetCount.ShouldBe(1);
            gatewayA.Sent.Count.ShouldBe(1);
            setup.Resolver.Verify(r => r.Release(gatewayA), Times.Once);
            setup.Resolver.Verify(r => r.Release(gatewayB), Times.Exactly(3));
        }

        [Theory]
        [InlineData("missing-settings")]
        [InlineData("empty-uid")]
        [InlineData("unknown-uid")]
        public async Task Send_FallsBackToNullSmsGateway_TestAsync(string mode)
        {
            SmsSettings settings = mode switch
            {
                "missing-settings" => null,
                "empty-uid" => new SmsSettings { SmsGateway = "  " },
                _ => new SmsSettings { SmsGateway = "not-a-registered-gateway" }
            };

            var gatewayA = new GatewayA();
            using var setup = new FactorySetup(() => Task.FromResult(settings), gatewayA);
            var delegating = new DelegatingSmsGateway(setup.Factory);

            var status = await delegating.SendSmsAsync("0820000000", "hello");

            status.IsSuccess.ShouldBeTrue();
            status.Message.ShouldBe("Message Sent from Null Gateway");
            gatewayA.Sent.ShouldBeEmpty();
            delegating.SettingsType.ShouldBeNull();
            setup.Resolver.Verify(r => r.Release(It.IsAny<object>()), Times.Never);
        }

        [Fact]
        public async Task ParallelResolveAndSend_WithCappedThreadPool_DoesNotStall_TestAsync()
        {
            const int operations = 32;
            const int delayMs = 400;
            const int workerThreads = 4;

            var gateway = new GatewayA();
            using var setup = new FactorySetup(async () =>
            {
                await Task.Delay(delayMs).ConfigureAwait(false);
                return new SmsSettings { SmsGateway = GatewayA.Uid };
            }, gateway);

            using var container = CreateContainer(setup.Factory);
            var resolveMs = new ConcurrentBag<long>();

            await WithCappedThreadPoolAsync(workerThreads, async () =>
            {
                var tasks = Enumerable.Range(0, operations).Select(_ => Task.Run(async () =>
                {
                    var started = Stopwatch.StartNew();
                    var resolved = container.Resolve<ISmsGateway>();
                    started.Stop();
                    resolveMs.Add(started.ElapsedMilliseconds);

                    var status = await resolved.SendSmsAsync("0820000000", "ping");
                    status.IsSuccess.ShouldBeTrue();
                    status.Message.ShouldBe("gateway-a");
                    container.Release(resolved);
                }));

                await Task.WhenAll(tasks).WaitAsync(TimeSpan.FromSeconds(20));
            });

            resolveMs.Count.ShouldBe(operations);
            var slowestResolve = resolveMs.Max();
            slowestResolve.ShouldBeLessThan(delayMs,
                $"Slowest ISmsGateway resolve took {slowestResolve}ms. Resolving must not wait for the {delayMs}ms settings read.");
            setup.SettingsReads.ShouldBe(operations);
            setup.Scans.ShouldBe(1);
            gateway.Sent.Count.ShouldBe(operations);
            setup.Resolver.Verify(r => r.Release(gateway), Times.Exactly(operations));
        }

        [Fact]
        public async Task GatewayTypeDiscovery_IsCached_AndScannedOnce_TestAsync()
        {
            var gatewayA = new GatewayA();
            using var setup = new FactorySetup(() => Task.FromResult(new SmsSettings { SmsGateway = GatewayA.Uid }), gatewayA);

            var scans = await Task.WhenAll(Enumerable.Range(0, 32).Select(_ => Task.Run(() => setup.Factory.GetSmsGatewayTypes())));

            setup.Scans.ShouldBe(1);
            setup.SettingsReads.ShouldBe(0);
            setup.Resolver.Verify(r => r.Resolve(It.IsAny<Type>()), Times.Never);

            var types = scans[0];
            types.Count.ShouldBe(1);
            var info = types.Single();
            info.Uid.ShouldBe(GatewayA.Uid);
            info.Type.ShouldBe(typeof(GatewayA));
            info.Name.ShouldBe("Gateway A");
            info.SettingsType.ShouldBe(typeof(GatewayASettings));
            types.ShouldNotContain(t => t.Type == typeof(UnregisteredGateway));
            types.ShouldNotContain(t => t.Type == typeof(NoUidGateway));
            types.ShouldNotContain(t => t.Type == typeof(DelegatingSmsGateway));

            var strictFinder = new Mock<ITypeFinder>(MockBehavior.Strict);
            var second = new SmsGatewayFactory(setup.SmsSettings, strictFinder.Object, setup.Resolver.Object);
            var again = second.GetSmsGatewayTypes();
            again.Single().Uid.ShouldBe(GatewayA.Uid);
            setup.Scans.ShouldBe(1);

            var resolved = await second.GetSmsGatewayAsync();
            resolved.ShouldBeSameAs(gatewayA);
            second.ReleaseGateway(resolved);
            second.ReleaseGateway(NullSmsGateway.Instance);
            setup.Scans.ShouldBe(1);
            setup.SettingsReads.ShouldBe(1);
            setup.Resolver.Verify(r => r.Release(gatewayA), Times.Once);
            setup.Resolver.Verify(r => r.Release(NullSmsGateway.Instance), Times.Never);
        }

        [Fact]
        public async Task SettingsType_IsPerInstance_AndCurrentInfoFollowsSelection_TestAsync()
        {
            var gatewayA = new GatewayA();
            var gatewayB = new GatewayB();
            var settingsForA = new SmsSettings { SmsGateway = GatewayA.Uid };
            var settingsForB = new SmsSettings { SmsGateway = GatewayB.Uid };
            using var setupA = new FactorySetup(() => Task.FromResult(settingsForA), gatewayA, gatewayB);
            using var setupB = new FactorySetup(() => Task.FromResult(settingsForB), gatewayA, gatewayB);
            var first = new DelegatingSmsGateway(setupA.Factory);
            var second = new DelegatingSmsGateway(setupB.Factory);

            first.SettingsType.ShouldBeNull();
            second.SettingsType.ShouldBeNull();

            var infoA = await setupA.Factory.GetCurrentGatewayInfoAsync();
            infoA.ShouldNotBeNull();
            infoA.Uid.ShouldBe(GatewayA.Uid);
            infoA.SettingsType.ShouldBe(typeof(GatewayASettings));
            setupA.Resolver.Verify(r => r.Resolve(It.IsAny<Type>()), Times.Never);
            first.SettingsType.ShouldBeNull();
            second.SettingsType.ShouldBeNull();

            await first.SendSmsAsync("0820000000", "from-a");
            await second.SendSmsAsync("0820000000", "from-b");

            first.SettingsType.ShouldBe(typeof(GatewayASettings));
            second.SettingsType.ShouldBe(typeof(GatewayBSettings));

            settingsForB.SmsGateway = GatewayA.Uid;
            var infoAfterSwitch = await setupB.Factory.GetCurrentGatewayInfoAsync();
            infoAfterSwitch.ShouldNotBeNull();
            infoAfterSwitch.Uid.ShouldBe(GatewayA.Uid);
            infoAfterSwitch.SettingsType.ShouldBe(typeof(GatewayASettings));
            second.SettingsType.ShouldBe(typeof(GatewayBSettings));
            first.SettingsType.ShouldBe(typeof(GatewayASettings));

            await second.SendSmsAsync("0820000000", "from-b-now-a");
            second.SettingsType.ShouldBe(typeof(GatewayASettings));
            first.SettingsType.ShouldBe(typeof(GatewayASettings));
            gatewayA.Sent.ToArray().ShouldBe(new[] { "from-a", "from-b-now-a" });
            gatewayB.Sent.ToArray().ShouldBe(new[] { "from-b" });

            setupA.Resolver.Verify(r => r.Release(gatewayA), Times.Once);
            setupA.Resolver.Verify(r => r.Release(gatewayB), Times.Never);
            setupB.Resolver.Verify(r => r.Release(gatewayB), Times.Once);
            setupB.Resolver.Verify(r => r.Release(gatewayA), Times.Once);
        }

        [Fact]
        public async Task ReleaseGateway_ReleasesResolvedInstance_AndIgnoresSharedNullInstance_TestAsync()
        {
            var gatewayA = new GatewayA();
            using var setup = new FactorySetup(() => Task.FromResult(new SmsSettings { SmsGateway = GatewayA.Uid }), gatewayA);

            var resolved = await setup.Factory.GetSmsGatewayAsync();
            resolved.ShouldBeSameAs(gatewayA);

            setup.Factory.ReleaseGateway(resolved);
            setup.Factory.ReleaseGateway(null);
            setup.Factory.ReleaseGateway(NullSmsGateway.Instance);

            setup.Resolver.Verify(r => r.Release(gatewayA), Times.Once);
            setup.Resolver.Verify(r => r.Release(NullSmsGateway.Instance), Times.Never);
            setup.Resolver.Verify(r => r.Release(null), Times.Never);
        }

        private static WindsorContainer CreateContainer(ISmsGatewayFactory factory)
        {
            var container = new WindsorContainer();
#pragma warning disable IDISP004 // Register returns this container for fluent chaining
            container.Register(
                Component.For<ISmsGatewayFactory>().Instance(factory),
                Component.For<ISmsGateway>().ImplementedBy<DelegatingSmsGateway>().LifestyleTransient());
#pragma warning restore IDISP004
            return container;
        }

        private static async Task WithCappedThreadPoolAsync(int workerThreads, Func<Task> action)
        {
            ThreadPool.GetMinThreads(out var minWorker, out var minIo);
            ThreadPool.GetMaxThreads(out var maxWorker, out var maxIo);

            var loweredMin = false;
            var loweredMax = false;
            try
            {
                loweredMin = ThreadPool.SetMinThreads(workerThreads, workerThreads);
                loweredMin.ShouldBeTrue($"Failed to lower ThreadPool min threads to {workerThreads}.");
                loweredMax = ThreadPool.SetMaxThreads(workerThreads, workerThreads);
                loweredMax.ShouldBeTrue($"Failed to cap ThreadPool max threads at {workerThreads}.");
                await action();
            }
            finally
            {
                if (loweredMax)
                    ThreadPool.SetMaxThreads(maxWorker, maxIo);
                if (loweredMin)
                    ThreadPool.SetMinThreads(minWorker, minIo);
            }
        }

        private sealed class FactorySetup : IDisposable
        {
            private readonly Dictionary<Type, ISmsGateway> _gateways;
            private int _scans;
            private int _settingsReads;

            public FactorySetup(Func<Task<SmsSettings>> readSettings, params ISmsGateway[] gateways)
            {
                _gateways = gateways.ToDictionary(gateway => gateway.GetType());

                var accessor = new Mock<ISettingAccessor<SmsSettings>>();
                accessor
                    .Setup(s => s.GetValueOrNullAsync(It.IsAny<SettingManagementContext>()))
                    .Returns(() =>
                    {
                        Interlocked.Increment(ref _settingsReads);
                        return readSettings();
                    });

                var smsSettings = new Mock<ISmsSettings>();
                smsSettings.SetupGet(s => s.SmsSettings).Returns(accessor.Object);
                SmsSettings = smsSettings.Object;

                var candidates = _gateways.Keys
                    .Concat(new[] { typeof(DelegatingSmsGateway), typeof(NoUidGateway), typeof(UnregisteredGateway) })
                    .ToArray();

                var typeFinder = new Mock<ITypeFinder>();
                typeFinder
                    .Setup(f => f.Find(It.IsAny<Func<Type, bool>>()))
                    .Returns<Func<Type, bool>>(predicate =>
                    {
                        Interlocked.Increment(ref _scans);
                        return candidates.Where(predicate).ToArray();
                    });

                Resolver = new Mock<IIocResolver>();
                Resolver
                    .Setup(r => r.IsRegistered(It.IsAny<Type>()))
                    .Returns<Type>(type => _gateways.ContainsKey(type) || type == typeof(NoUidGateway));
                Resolver
                    .Setup(r => r.Resolve(It.IsAny<Type>()))
                    .Returns<Type>(type => _gateways[type]);

                Factory = new SmsGatewayFactory(SmsSettings, typeFinder.Object, Resolver.Object);
            }

            public SmsGatewayFactory Factory { get; }
            public ISmsSettings SmsSettings { get; }
            public Mock<IIocResolver> Resolver { get; }
            public int Scans => Volatile.Read(ref _scans);
            public int SettingsReads => Volatile.Read(ref _settingsReads);

            public void Dispose()
            {
            }
        }

        [ClassUid(Uid)]
        [Display(Name = "Gateway A")]
        private sealed class GatewayA : ConfigurableSmsGateway<GatewayASettings>
        {
            public const string Uid = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1";

            public ConcurrentQueue<string> Sent { get; } = new ConcurrentQueue<string>();

            public override Task<SendStatus> SendSmsAsync(string mobileNumber, string body)
            {
                Sent.Enqueue(body);
                return Task.FromResult(SendStatus.Success("gateway-a"));
            }

            public override Task<GatewayASettings> GetTypedSettingsAsync() => Task.FromResult(new GatewayASettings());

            public override Task SetTypedSettingsAsync(GatewayASettings settings) => Task.CompletedTask;
        }

        [ClassUid(Uid)]
        [Display(Name = "Gateway B")]
        private sealed class GatewayB : ConfigurableSmsGateway<GatewayBSettings>
        {
            public const string Uid = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2";

            public ConcurrentQueue<string> Sent { get; } = new ConcurrentQueue<string>();
            public GatewayBSettings Marker { get; } = new GatewayBSettings();
            public int SetCount;

            public override Task<SendStatus> SendSmsAsync(string mobileNumber, string body)
            {
                Sent.Enqueue(body);
                return Task.FromResult(SendStatus.Success("gateway-b"));
            }

            public override Task<GatewayBSettings> GetTypedSettingsAsync() => Task.FromResult(Marker);

            public override Task SetTypedSettingsAsync(GatewayBSettings settings)
            {
                Interlocked.Increment(ref SetCount);
                return Task.CompletedTask;
            }
        }

        private sealed class GatewayASettings
        {
        }

        private sealed class GatewayBSettings
        {
        }

        [ClassUid("cccccccc-cccc-cccc-cccc-ccccccccccc3")]
        [Display(Name = "Unregistered")]
        private sealed class UnregisteredGateway : ConfigurableSmsGateway<GatewayASettings>
        {
            public override Task<SendStatus> SendSmsAsync(string mobileNumber, string body) =>
                Task.FromResult(SendStatus.Failed("unregistered"));

            public override Task<GatewayASettings> GetTypedSettingsAsync() => Task.FromResult(new GatewayASettings());

            public override Task SetTypedSettingsAsync(GatewayASettings settings) => Task.CompletedTask;
        }

        private sealed class NoUidGateway : ISmsGateway
        {
            public Type SettingsType => typeof(string);

            public Task<SendStatus> SendSmsAsync(string mobileNumber, string body) =>
                Task.FromResult(SendStatus.Failed("no-uid"));

            public Task<object> GetSettingsAsync() => Task.FromResult<object>(null);

            public Task SetSettingsAsync(object settings) => Task.CompletedTask;
        }
    }
}
