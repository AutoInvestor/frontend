import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    AddAssetForm,
    AlertCard,
    AssetTable,
    NewsCard,
    PortfolioChart,
    SimulationPanel,
} from "@/components";

import { PortfolioHttpService } from "@/services/portfolio-http-service";
import { AssetsHttpService } from "@/services/assets-http-service";
import { DecisionHttpService } from "@/services/decision-http-service";
import { NewsHttpService } from "@/services/news-http-service";
import { AlertsHttpService } from "@/services/alerts-http-service";
import { UsersHttpService } from "@/services/users-http-service";

import { Asset } from "@/model/Asset";
import { PortfolioHolding } from "@/model/PortfolioHolding";
import { NewsItem } from "@/model/NewsItem";
import { Alert as AlertModel } from "@/model/Alert";
import { Decision } from "@/model/Decision";
import { User } from "@/model/User";

import {
    AlertTriangle,
    Newspaper,
    Play,
    TrendingDown,
    TrendingUp,
    User as UserIcon,
} from "lucide-react";

import { format, isToday } from "date-fns";

const portfolioService = new PortfolioHttpService();
const assetsService = new AssetsHttpService();
const decisionService = new DecisionHttpService();
const newsService = new NewsHttpService();
const alertsService = new AlertsHttpService();
const usersService = new UsersHttpService();

export default function Dashboard() {
    const [portfolioHoldings, setPortfolioHoldings] =
        useState<PortfolioHolding[]>([]);
    const [assetsMap, setAssetsMap] = useState<Record<string, Asset>>({});
    const [decisionsMap, setDecisionsMap] = useState<Record<string, Decision[]>>({});
    const [user, setUser] = useState<User | null>(null);

    const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
    const [alerts, setAlerts] = useState<AlertModel[]>([]);

    const [showDetailedNews, setShowDetailedNews] = useState(false);
    const [showDetailedAlerts, setShowDetailedAlerts] = useState(false);
    const [showSimulation, setShowSimulation] = useState(false);

    // 1) Load the user (for risk level, etc.)
    useEffect(() => {
        usersService.getUser().then((u) => setUser(u));
    }, []);

    // 2) Load portfolio holdings, then fetch the necessary asset & decision data
    useEffect(() => {
        async function fetchPortfolioData() {
            const holdings = await portfolioService.getPortfolioHoldings();
            setPortfolioHoldings(holdings);

            const distinctAssetIds = [...new Set(holdings.map((h) => h.assetId))];

            const assetsArray = await Promise.all(
                distinctAssetIds.map((id) => assetsService.getAsset(id))
            );

            setAssetsMap(
                assetsArray.reduce<Record<string, Asset>>((acc, asset) => {
                    acc[asset.assetId] = asset;
                    return acc;
                }, {})
            );

            if (user) {
                const newDecisionsMap: Record<string, Decision[]> = {};
                await Promise.all(
                    distinctAssetIds.map(async (assetId) => {
                        const ds = await decisionService.getDecisions(
                            assetId,
                            user.riskLevel
                        );
                        newDecisionsMap[assetId] = ds;
                    })
                );
                setDecisionsMap(newDecisionsMap);
            }
        }

        if (user) {
            fetchPortfolioData().catch(console.error);
        }
    }, [user]);

    // 3) Load News and Alerts
    useEffect(() => {
        async function fetchNewsAndAlerts() {
            const [news, alertList] = await Promise.all([
                newsService.getNews(),
                alertsService.getAlerts(),
            ]);
            setNewsItems(news);
            setAlerts(alertList);

            const allAssetIds = new Set<string>();
            news.forEach((n) => allAssetIds.add(n.assetId));
            alertList.forEach((a) => allAssetIds.add(a.assetId));

            const missingIds = Array.from(allAssetIds).filter((id) => !(id in assetsMap));
            if (missingIds.length) {
                const newAssets = await Promise.all(
                    missingIds.map((id) => assetsService.getAsset(id))
                );
                setAssetsMap((prev) => {
                    const next = { ...prev };
                    newAssets.forEach((a) => {
                        next[a.assetId] = a;
                    });
                    return next;
                });
            }
        }

        fetchNewsAndAlerts().catch(console.error);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 4) Compute derived portfolio summary (value, change, etc.)
    const portfolioSummary = useMemo(() => {
        let totalCurrentValueCents = 0;
        let totalCostCents = 0;

        portfolioHoldings.forEach((h) => {
            const asset = assetsMap[h.assetId];
            if (asset) {
                const currentPriceCents = h.boughtPrice; // TODO: replace with real price fetch
                totalCurrentValueCents += currentPriceCents * h.amount;
                totalCostCents += h.boughtPrice * h.amount;
            }
        });

        const currentValue = totalCurrentValueCents / 100;
        const costValue = totalCostCents / 100;
        const change = currentValue - costValue;
        const changePercent = costValue === 0 ? 0 : (change / costValue) * 100;

        return { currentValue, change, changePercent };
    }, [portfolioHoldings, assetsMap]);

    // 5) Compute “today’s” news summary
    const todaysNews = useMemo(
        () => newsItems.filter((n) => isToday(new Date(n.date))),
        [newsItems]
    );

    const latestNewsItem = useMemo(() => {
        if (newsItems.length === 0) return null;
        return [...newsItems].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];
    }, [newsItems]);

    // 6) Compute “last 24h” alerts summary
    const recentAlerts = useMemo(
        () =>
            alerts.filter(
                (a) => new Date(a.date).getTime() >= Date.now() - 1000 * 60 * 60 * 24
            ),
        [alerts]
    );

    const latestAlert = useMemo(() => {
        if (alerts.length === 0) return null;
        return [...alerts].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];
    }, [alerts]);

    // 7) Compute tickers arrays for latest news & alerts
    const latestNewsTickers = useMemo(() => {
        if (!latestNewsItem) return [];
        const asset = assetsMap[latestNewsItem.assetId];
        return asset ? [asset.ticker] : [];
    }, [latestNewsItem, assetsMap]);

    const latestAlertsTickers = useMemo(() => {
        if (!latestAlert) return [];
        const asset = assetsMap[latestAlert.assetId];
        return asset ? [asset.ticker] : [];
    }, [latestAlert, assetsMap]);

    // 8) Timestamp formatter
    const formatTimestamp = (dateStr: string | Date) =>
        format(new Date(dateStr), "MMMM d, yyyy 'at' hh:mm:ss a");

    // ------- Render helpers --------
    const BaseLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <div className="min-h-screen bg-background text-foreground">
            {children}
        </div>
    );

    // ------------- Conditional pages -------------
    if (showSimulation) {
        return (
            <BaseLayout>
                <header className="flex items-center justify-between p-6 border-b border-border">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => setShowSimulation(false)}
                            className="text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                            ← Back to Portfolio
                        </Button>
                        <h1 className="text-2xl font-bold">Portfolio Simulation</h1>
                    </div>
                    <Link to="/profile">
                        <Button variant="ghost" className="flex items-center gap-2">
                            <UserIcon className="h-5 w-5" />
                            <span>Profile</span>
                        </Button>
                    </Link>
                </header>
                <div className="p-6">
                    <SimulationPanel
                        holdings={portfolioHoldings}
                        riskLevel={user?.riskLevel ?? 1}
                    />
                </div>
            </BaseLayout>
        );
    }

    if (showDetailedNews) {
        return (
            <BaseLayout>
                <header className="flex items-center justify-between p-6 border-b border-border">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => setShowDetailedNews(false)}
                            className="text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                            ← Back to Portfolio
                        </Button>
                        <h1 className="text-2xl font-bold">Market News</h1>
                    </div>
                    <Link to="/profile">
                        <Button variant="ghost" className="flex items-center gap-2">
                            <UserIcon className="h-5 w-5" />
                            <span>Profile</span>
                        </Button>
                    </Link>
                </header>

                <div className="p-6 space-y-4">
                    {newsItems.map((n) => {
                        const asset = assetsMap[n.assetId];
                        return (
                            <NewsCard
                                key={n.url}
                                stocks={asset ? [asset.ticker] : []}
                                title={n.title}
                                timestamp={formatTimestamp(n.date)}
                                url={n.url}
                            />
                        );
                    })}
                </div>
            </BaseLayout>
        );
    }

    if (showDetailedAlerts) {
        return (
            <BaseLayout>
                <header className="flex items-center justify-between p-6 border-b border-border">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => setShowDetailedAlerts(false)}
                            className="text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                            ← Back to Portfolio
                        </Button>
                        <h1 className="text-2xl font-bold">Portfolio Alerts</h1>
                    </div>
                    <Link to="/profile">
                        <Button variant="ghost" className="flex items-center gap-2">
                            <UserIcon className="h-5 w-5" />
                            <span>Profile</span>
                        </Button>
                    </Link>
                </header>

                <div className="p-6 space-y-4">
                    {alerts.map((a) => {
                        const asset = assetsMap[a.assetId];
                        const message =
                            a.type === "BUY"
                                ? "Technical indicators suggest buying opportunity"
                                : a.type === "SELL"
                                    ? "Technical indicators suggest selling opportunity"
                                    : "Technical indicators suggest no change";
                        return (
                            <AlertCard
                                key={a.date + a.assetId}
                                stock={asset ? asset.ticker : ""}
                                message={message}
                                timestamp={formatTimestamp(a.date)}
                            />
                        );
                    })}
                </div>
            </BaseLayout>
        );
    }

    // ------------- Main dashboard -------------
    return (
        <BaseLayout>
            {/* Header */}
            <header className="flex items-center justify-between p-6 border-b border-border">
                <div>
                    <h1 className="text-2xl font-bold">AutoInvestor</h1>
                    <p className="text-muted-foreground text-sm">Portfolio Management</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        onClick={() => setShowSimulation(true)}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
                    >
                        <Play className="h-4 w-4" />
                        Simulate
                    </Button>

                    <Link to="/profile">
                        <Button variant="ghost" className="flex items-center gap-2">
                            <UserIcon className="h-5 w-5" />
                            <span>Profile</span>
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <div className="p-6 space-y-6">
                {/* ========== Portfolio Performance & Quick Actions ========== */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="bg-card border-border lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Portfolio Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-3xl font-bold">
                                        {`$${portfolioSummary.currentValue.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}`}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        {portfolioSummary.change < 0 ? (
                                            <TrendingDown className="h-4 w-4 text-red-400" />
                                        ) : (
                                            <TrendingUp className="h-4 w-4 text-green-400" />
                                        )}
                                        <span
                                            className={
                                                portfolioSummary.change < 0
                                                    ? "text-red-400"
                                                    : "text-green-400"
                                            }
                                        >
                      {`$${Math.abs(portfolioSummary.change).toFixed(2)} (${portfolioSummary.changePercent.toFixed(2)}%)`}
                    </span>
                                    </div>
                                </div>
                            </div>
                            <PortfolioChart
                                holdings={portfolioHoldings}
                                assetsMap={assetsMap}
                                decisionsMap={decisionsMap}
                            />
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <AddAssetForm
                                availableAssets={Object.values(assetsMap)}
                                onAdd={async (assetId: string, shares: number, buyPrice: number) => {
                                    const newHolding: PortfolioHolding = {
                                        assetId,
                                        amount: shares,
                                        boughtPrice: Math.round(buyPrice * 100),
                                    };
                                    await portfolioService.createHolding(newHolding);
                                    const updated = await portfolioService.getPortfolioHoldings();
                                    setPortfolioHoldings(updated);
                                }}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* ========== Summary Cards: News & Alerts ========== */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* News Summary */}
                    <Card
                        className="bg-card border-border hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => setShowDetailedNews(true)}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/20 rounded-lg">
                                        <Newspaper className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Market News</h3>
                                        <p className="text-muted-foreground text-sm">
                                            {todaysNews.length} new articles today
                                        </p>
                                    </div>
                                </div>
                                <Play className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                            </div>
                            <div className="mt-4">
                                {latestNewsItem ? (
                                    <>
                                        <p className="text-muted-foreground text-sm">
                                            Latest: {latestNewsItem.title}
                                        </p>
                                        <div className="flex gap-2 mt-2">
                                            {latestNewsTickers.map((t) => (
                                                <Badge key={t} variant="secondary" className="text-xs">
                                                    {t}
                                                </Badge>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-muted-foreground text-sm">No news available</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Alerts Summary */}
                    <Card
                        className="bg-card border-border hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => setShowDetailedAlerts(true)}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-destructive/20 rounded-lg">
                                        <AlertTriangle className="h-5 w-5 text-destructive" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Portfolio Alerts</h3>
                                        <p className="text-muted-foreground text-sm">
                                            {recentAlerts.length} alerts in the last day
                                        </p>
                                    </div>
                                </div>
                                <Play className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                            </div>
                            <div className="mt-4">
                                {latestAlert ? (
                                    <>
                                        <p className="text-muted-foreground text-sm">
                                            Latest:{" "}
                                            {latestAlert.type === "BUY"
                                                ? "Technical indicators suggest buying opportunity"
                                                : latestAlert.type === "SELL"
                                                    ? "Technical indicators suggest selling opportunity"
                                                    : "Technical indicators suggest no change"}
                                        </p>
                                        <div className="flex gap-2 mt-2">
                                            {latestAlertsTickers.map((t) => (
                                                <Badge key={t} variant="secondary" className="text-xs">
                                                    {t}
                                                </Badge>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-muted-foreground text-sm">No alerts available</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ========== Your Holdings Table ========== */}
                <Card className="bg-card border-border">
                    <CardHeader>
                        <CardTitle>Your Holdings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AssetTable
                            holdings={portfolioHoldings}
                            assetsMap={assetsMap}
                            onUpdate={async (updatedHolding) => {
                                await portfolioService.updateHolding(updatedHolding);
                                const re = await portfolioService.getPortfolioHoldings();
                                setPortfolioHoldings(re);
                            }}
                            onDelete={async (assetId) => {
                                await portfolioService.deleteHolding(assetId);
                                const re = await portfolioService.getPortfolioHoldings();
                                setPortfolioHoldings(re);
                            }}
                        />
                    </CardContent>
                </Card>
            </div>
        </BaseLayout>
    );
}