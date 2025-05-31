import {useEffect, useMemo, useState} from "react";
import {Link} from "react-router-dom";

import {Card, CardContent, CardHeader, CardTitle,} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {AddAssetForm, AlertCard, AssetTable, NewsCard, PortfolioChart, SimulationPanel,} from "@/components";

import {PortfolioHttpService} from "@/services/portfolio-http-service";
import {AssetsHttpService} from "@/services/assets-http-service";
import {DecisionHttpService} from "@/services/decision-http-service";
import {NewsHttpService} from "@/services/news-http-service";
import {AlertsHttpService} from "@/services/alerts-http-service";
import {UsersHttpService} from "@/services/users-http-service";

import {Asset} from "@/model/Asset";
import {PortfolioHolding} from "@/model/PortfolioHolding";
import {NewsItem} from "@/model/NewsItem";
import {Alert as AlertModel} from "@/model/Alert";
import {Decision} from "@/model/Decision";
import {User} from "@/model/User";

import {AlertTriangle, Newspaper, Play, TrendingDown, TrendingUp, User as UserIcon,} from "lucide-react";

import {format, isToday} from "date-fns";

const portfolioService = new PortfolioHttpService();
const assetsService = new AssetsHttpService();
const decisionService = new DecisionHttpService();
const newsService = new NewsHttpService();
const alertsService = new AlertsHttpService();
const usersService = new UsersHttpService();

export default function Dashboard() {
    const [portfolioHoldings, setPortfolioHoldings] = useState<
        PortfolioHolding[]
    >([]);
    const [assetsMap, setAssetsMap] = useState<Record<string, Asset>>({});
    const [decisionsMap, setDecisionsMap] = useState<
        Record<string, Decision[]>
    >({});
    const [user, setUser] = useState<User | null>(null);

    const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
    const [alerts, setAlerts] = useState<AlertModel[]>([]);

    const [showDetailedNews, setShowDetailedNews] = useState(false);
    const [showDetailedAlerts, setShowDetailedAlerts] = useState(false);
    const [showSimulation, setShowSimulation] = useState(false);

    //
    // 1) Load the user (for risk level, etc.)
    //
    useEffect(() => {
        usersService.getUser().then((u) => {
            setUser(u);
        });
    }, []);

    //
    // 2) Load portfolio holdings, then fetch the necessary asset & decision data
    //
    useEffect(() => {
        async function fetchPortfolioData() {
            // a) get holdings
            const holdings = await portfolioService.getPortfolioHoldings();
            setPortfolioHoldings(holdings);

            // b) fetch Asset details (ticker, mic) for each distinct assetId
            const distinctAssetIds = [
                ...new Set(holdings.map((h) => h.assetId)),
            ];
            const assetsArray = await Promise.all(
                distinctAssetIds.map((id) => assetsService.getAsset(id))
            );
            const newAssetsMap: Record<string, Asset> = {};
            assetsArray.forEach((a) => {
                newAssetsMap[a.assetId] = a;
            });
            setAssetsMap(newAssetsMap);

            // c) for each asset, fetch its decisions (using the user’s risk level)
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

        // we only can fetch decisions after user is loaded
        if (user) {
            fetchPortfolioData().catch(console.error);
        }
    }, [user]);

    //
    // 3) Load News and Alerts
    //
    useEffect(() => {
        async function fetchNewsAndAlerts() {
            // fetch news
            const news = await newsService.getNews();
            setNewsItems(news);

            // fetch alerts
            const alertList = await alertsService.getAlerts();
            setAlerts(alertList);

            // also fetch any missing asset info for news & alerts
            const allAssetIds = new Set<string>();
            news.forEach((n) => allAssetIds.add(n.assetId));
            alertList.forEach((a) => allAssetIds.add(a.assetId));

            // merge with existing assetsMap (don’t refetch those we already have)
            const missingIds = Array.from(allAssetIds).filter(
                (id) => !(id in assetsMap)
            );
            if (missingIds.length) {
                const newAssets = await Promise.all(
                    missingIds.map((id) => assetsService.getAsset(id))
                );
                setAssetsMap((prev) => {
                    const copy = { ...prev };
                    newAssets.forEach((a) => {
                        copy[a.assetId] = a;
                    });
                    return copy;
                });
            }
        }

        fetchNewsAndAlerts().catch(console.error);
        // We only want to run this once on mount, even if assetsMap changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    //
    // 4) Compute derived portfolio summary (value, change, etc.)
    //
    const portfolioSummary = useMemo(() => {
        let totalCurrentValueCents = 0;
        let totalCostCents = 0;

        portfolioHoldings.forEach((h) => {
            const asset = assetsMap[h.assetId];
            if (asset) {
                // *** TODO: your backend’s getPrice returns { price: number } in cents? ***
                // We’ll call getPrice synchronously here, but in reality getPrice is async.
                // For “first pass”, we’ll treat each holding’s current price as if it were already known.
                // Once you finalize how getPrice works in your HttpService, replace this with a real fetch.
                // MOCK: assume price == boughtPrice for now.
                const currentPriceCents = h.boughtPrice; // MOCK ⇒ you will fetch actual via assetsService.getPrice(...)
                totalCurrentValueCents += currentPriceCents * h.amount;
                totalCostCents += h.boughtPrice * h.amount;
            }
        });

        const currentValue = totalCurrentValueCents / 100;
        const costValue = totalCostCents / 100;
        const change = currentValue - costValue;
        const changePercent =
            costValue === 0 ? 0 : (change / costValue) * 100;

        return {
            currentValue,
            change,
            changePercent,
        };
    }, [portfolioHoldings, assetsMap]);

    //
    // 5) Compute “today’s” news summary
    //
    const todaysNews = useMemo(() => {
        return newsItems.filter((n) => isToday(new Date(n.date)));
    }, [newsItems]);

    const latestNewsItem = useMemo(() => {
        if (newsItems.length === 0) return null;
        // sort descending by date
        const sorted = [...newsItems].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        return sorted[0];
    }, [newsItems]);

    //
    // 6) Compute “last 24h” alerts summary
    //
    const recentAlerts = useMemo(() => {
        return alerts.filter((a) =>
            // “last day” meaning last 24h
            new Date(a.date).getTime() >=
            Date.now() - 1000 * 60 * 60 * 24
        );
    }, [alerts]);

    const latestAlert = useMemo(() => {
        if (alerts.length === 0) return null;
        const sorted = [...alerts].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        return sorted[0];
    }, [alerts]);

    //
    // 7) Compute tickers arrays for latest news & alerts
    //
    const latestNewsTickers = useMemo(() => {
        if (!latestNewsItem) return [];
        // MOCK: POC’s NewsCard expects stocks: string[]
        // We only have assetId, so translate to ticker via assetsMap
        const tid = latestNewsItem.assetId;
        const asset = assetsMap[tid];
        return asset ? [asset.ticker] : [];
    }, [latestNewsItem, assetsMap]);

    const latestAlertsTickers = useMemo(() => {
        if (!latestAlert) return [];
        const asset = assetsMap[latestAlert.assetId];
        return asset ? [asset.ticker] : [];
    }, [latestAlert, assetsMap]);

    //
    // 8) Format timestamps for display (POC used “May 31, 2025 at HH:MM:SS AM/PM”)
    //
    function formatTimestamp(dateStr: string | Date) {
        const d = new Date(dateStr);
        return format(d, "MMMM d, yyyy 'at' hh:mm:ss a");
    }

    //
    // 9) Render
    //
    if (showSimulation) {
        return (
            <div className="min-h-screen bg-black text-white">
                {/* Header */}
                <header className="flex items-center justify-between p-6 border-b border-gray-700">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => setShowSimulation(false)}
                            className="text-gray-300 hover:text-white hover:bg-gray-800"
                        >
                            ← Back to Portfolio
                        </Button>
                        <h1 className="text-2xl font-bold">Portfolio Simulation</h1>
                    </div>
                    <Link to="/profile">
                        <Button
                            variant="ghost"
                            className="flex items-center gap-2 text-white hover:bg-gray-800"
                        >
                            <UserIcon className="h-5 w-5" />
                            <span>Profile</span>
                        </Button>
                    </Link>
                </header>

                <div className="p-6">
                    <SimulationPanel
                        // Pass any props needed by SimulationPanel (e.g. portfolioHoldings, user.riskLevel, etc.)
                        holdings={portfolioHoldings}
                        riskLevel={user?.riskLevel ?? 1}
                    />
                </div>
            </div>
        );
    }

    if (showDetailedNews) {
        return (
            <div className="min-h-screen bg-black text-white">
                {/* Header */}
                <header className="flex items-center justify-between p-6 border-b border-gray-700">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => setShowDetailedNews(false)}
                            className="text-gray-300 hover:text-white hover:bg-gray-800"
                        >
                            ← Back to Portfolio
                        </Button>
                        <h1 className="text-2xl font-bold">Market News</h1>
                    </div>
                    <Link to="/profile">
                        <Button
                            variant="ghost"
                            className="flex items-center gap-2 text-white hover:bg-gray-800"
                        >
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
                                stocks={asset ? [asset.ticker] : []} // fallback: empty array
                                title={n.title}
                                timestamp={formatTimestamp(n.date)}
                                url={n.url}
                            />
                        );
                    })}
                </div>
            </div>
        );
    }

    if (showDetailedAlerts) {
        return (
            <div className="min-h-screen bg-black text-white">
                {/* Header */}
                <header className="flex items-center justify-between p-6 border-b border-gray-700">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => setShowDetailedAlerts(false)}
                            className="text-gray-300 hover:text-white hover:bg-gray-800"
                        >
                            ← Back to Portfolio
                        </Button>
                        <h1 className="text-2xl font-bold">Portfolio Alerts</h1>
                    </div>
                    <Link to="/profile">
                        <Button
                            variant="ghost"
                            className="flex items-center gap-2 text-white hover:bg-gray-800"
                        >
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
            </div>
        );
    }

    //
    // MAIN “HOMEPAGE” RENDER
    //
    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <header className="flex items-center justify-between p-6 border-b border-gray-700">
                <div>
                    <h1 className="text-2xl font-bold text-white">AutoInvestor</h1>
                    <p className="text-gray-400 text-sm">Portfolio Management</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        onClick={() => setShowSimulation(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                    >
                        <Play className="h-4 w-4" />
                        Simulate
                    </Button>
                    <Link to="/profile">
                        <Button
                            variant="ghost"
                            className="flex items-center gap-2 text-white hover:bg-gray-800"
                        >
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
                    <Card className="bg-gray-900 border-gray-700 lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-white">
                                Portfolio Performance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-3xl font-bold text-white">
                                        ${portfolioSummary.currentValue.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
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
                      ${Math.abs(portfolioSummary.change).toFixed(2)} (
                                            {portfolioSummary.changePercent.toFixed(2)}%)
                    </span>
                                    </div>
                                </div>
                            </div>
                            {/* POC component: PortfolioChart */}
                            {/* Pass in all of your holdings, assetsMap, and decisionsMap so it can plot prices over time. */}
                            <PortfolioChart
                                holdings={portfolioHoldings}
                                assetsMap={assetsMap}
                                decisionsMap={decisionsMap}
                                riskLevel={user?.riskLevel ?? 1}
                            />
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-900 border-gray-700">
                        <CardHeader>
                            <CardTitle className="text-white">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* POC component: AddAssetForm
                  - onAdd should call portfolioService.createHolding(…) then re‐fetch holdings
              */}
                            <AddAssetForm
                                availableAssets={Object.values(assetsMap)}
                                onAdd={async (assetId: string, shares: number, buyPrice: number) => {
                                    // Build a PortfolioHolding object
                                    const newHolding: PortfolioHolding = {
                                        assetId,
                                        amount: shares,
                                        boughtPrice: Math.round(buyPrice * 100),
                                    };
                                    await portfolioService.createHolding(newHolding);
                                    // Re‐fetch holdings
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
                        className="bg-gray-900 border-gray-700 hover:bg-gray-800/50 transition-colors cursor-pointer"
                        onClick={() => setShowDetailedNews(true)}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-600/20 rounded-lg">
                                        <Newspaper className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-medium">Market News</h3>
                                        <p className="text-gray-400 text-sm">
                                            {todaysNews.length} new articles today
                                        </p>
                                    </div>
                                </div>
                                <Play className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                            <div className="mt-4">
                                {latestNewsItem ? (
                                    <>
                                        <p className="text-gray-300 text-sm">
                                            Latest: {latestNewsItem.title}
                                        </p>
                                        <div className="flex gap-2 mt-2">
                                            {latestNewsTickers.map((t) => (
                                                <Badge
                                                    key={t}
                                                    variant="secondary"
                                                    className="bg-gray-800 text-gray-300 text-xs"
                                                >
                                                    {t}
                                                </Badge>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-gray-500 text-sm">No news available</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Alerts Summary */}
                    <Card
                        className="bg-gray-900 border-gray-700 hover:bg-gray-800/50 transition-colors cursor-pointer"
                        onClick={() => setShowDetailedAlerts(true)}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-600/20 rounded-lg">
                                        <AlertTriangle className="h-5 w-5 text-orange-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-medium">Portfolio Alerts</h3>
                                        <p className="text-gray-400 text-sm">
                                            {recentAlerts.length} alerts in the last day
                                        </p>
                                    </div>
                                </div>
                                <Play className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                            <div className="mt-4">
                                {latestAlert ? (
                                    <>
                                        <p className="text-gray-300 text-sm">
                                            Latest:{" "}
                                            {(latestAlert.type === "BUY"
                                                ? "Technical indicators suggest buying opportunity"
                                                : latestAlert.type === "SELL"
                                                    ? "Technical indicators suggest selling opportunity"
                                                    : "Technical indicators suggest no change")}
                                        </p>
                                        <div className="flex gap-2 mt-2">
                                            {latestAlertsTickers.map((t) => (
                                                <Badge
                                                    key={t}
                                                    variant="secondary"
                                                    className="bg-gray-800 text-gray-300 text-xs"
                                                >
                                                    {t}
                                                </Badge>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-gray-500 text-sm">No alerts available</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ========== Your Holdings Table ========== */}
                <Card className="bg-gray-900 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white">Your Holdings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* POC component: AssetTable
                - expects a list of holdings, plus asset metadata & current price. 
                - We’ll pass portfolioHoldings & assetsMap; the component itself can call getPrice() internally if needed.
            */}
                        <AssetTable
                            holdings={portfolioHoldings}
                            assetsMap={assetsMap}
                            onUpdate={async (updatedHolding) => {
                                await portfolioService.updateHolding(updatedHolding);
                                // re‐fetch
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
        </div>
    );
}
