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
    ChevronRight,
    Newspaper,
    Play,
    User as UserIcon,
} from "lucide-react";

import { format, isToday } from "date-fns";

/* ------------------------------------------------------------------
 *  Services (instantiated once outside the component)
 * ----------------------------------------------------------------*/
const portfolioService = new PortfolioHttpService();
const assetsService = new AssetsHttpService();
const decisionService = new DecisionHttpService();
const newsService = new NewsHttpService();
const alertsService = new AlertsHttpService();
const usersService = new UsersHttpService();

export default function Dashboard() {
    /* ------------------------------------------------------------------
     *  Local state
     * ----------------------------------------------------------------*/
    const [portfolioHoldings, setPortfolioHoldings] = useState<PortfolioHolding[]>([]);
    const [assetsMap, setAssetsMap] = useState<Record<string, Asset>>({});
    const [, setDecisionsMap] = useState<Record<string, Decision[]>>({});
    const [user, setUser] = useState<User | null>(null);

    const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
    const [alerts, setAlerts] = useState<AlertModel[]>([]);

    const [showDetailedNews, setShowDetailedNews] = useState(false);
    const [showDetailedAlerts, setShowDetailedAlerts] = useState(false);
    const [showSimulation, setShowSimulation] = useState(false);

    /* ------------------------------------------------------------------
     *  Data fetching
     * ----------------------------------------------------------------*/
    useEffect(() => {
        usersService.getUser().then(setUser).catch(console.error);
    }, []);

    /* -------------------- Portfolio + decisions -------------------- */
    useEffect(() => {
        if (!user) return;

        (async () => {
            const holdings = await portfolioService.getPortfolioHoldings();
            setPortfolioHoldings(holdings);

            const distinct = [...new Set(holdings.map((h) => h.assetId))];
            const assets = await Promise.all(distinct.map((id) => assetsService.getAsset(id)));
            setAssetsMap(
                assets.reduce<Record<string, Asset>>((acc, a) => ({ ...acc, [a.assetId]: a }), {})
            );

            const decisionsObj: Record<string, Decision[]> = {};
            await Promise.all(
                distinct.map(async (assetId) => {
                    decisionsObj[assetId] = await decisionService.getDecisions(assetId, user.riskLevel);
                })
            );
            setDecisionsMap(decisionsObj);
        })().catch(console.error);
    }, [user]);

    /* ---------------------- News + alerts -------------------------- */
    useEffect(() => {
        (async () => {
            const [news, al] = await Promise.all([
                newsService.getNews(),
                alertsService.getAlerts(),
            ]);
            setNewsItems(news);
            setAlerts(al);

            const ids = new Set<string>();
            news.forEach((n) => ids.add(n.assetId));
            al.forEach((a) => ids.add(a.assetId));
            const missing = [...ids].filter((id) => !(id in assetsMap));
            if (missing.length) {
                const newAssets = await Promise.all(missing.map((id) => assetsService.getAsset(id)));
                setAssetsMap((prev) =>
                    newAssets.reduce((acc, a) => ({ ...acc, [a.assetId]: a }), prev)
                );
            }
        })().catch(console.error);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    /* ------------------------------------------------------------------
     *  Derived data helpers
     * ----------------------------------------------------------------*/
    const todaysNews = useMemo(
        () => newsItems.filter((n) => isToday(new Date(n.date))),
        [newsItems]
    );
    const latestNewsItem = useMemo(
        () => [...newsItems].sort((a, b) => +new Date(b.date) - +new Date(a.date))[0],
        [newsItems]
    );
    const recentAlerts = useMemo(
        () => alerts.filter((a) => +new Date(a.date) >= Date.now() - 86_400_000),
        [alerts]
    );
    const latestAlert = useMemo(
        () => [...alerts].sort((a, b) => +new Date(b.date) - +new Date(a.date))[0],
        [alerts]
    );

    const latestNewsTickers = useMemo(
        () =>
            latestNewsItem
                ? [assetsMap[latestNewsItem.assetId]?.ticker].filter(Boolean)
                : [],
        [latestNewsItem, assetsMap]
    );
    const latestAlertsTickers = useMemo(
        () =>
            latestAlert ? [assetsMap[latestAlert.assetId]?.ticker].filter(Boolean) : [],
        [latestAlert, assetsMap]
    );

    const formatTimestamp = (d: string | Date) =>
        format(new Date(d), "MMM d, yyyy ‧ hh:mm a");

    /* ------------------------------------------------------------------
     *  Helpers
     * ----------------------------------------------------------------*/
    const BaseLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <div className="min-h-screen bg-background text-foreground">{children}</div>
    );

    /* ------------------------------------------------------------------
     *  Conditional routes (Simulation, News, Alerts)
     * ----------------------------------------------------------------*/
    if (showSimulation) {
        return (
            <BaseLayout>
                <header className="flex items-center justify-between px-6 py-3 border-b border-border">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => setShowSimulation(false)}
                            className="text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                            ← Back
                        </Button>
                        <h1 className="text-xl font-bold">Portfolio Simulation</h1>
                    </div>
                    <Link to="/profile">
                        <Button variant="ghost" className="flex items-center gap-2">
                            <UserIcon className="h-5 w-5" />
                            Profile
                        </Button>
                    </Link>
                </header>
                <div className="p-4">
                    <SimulationPanel holdings={portfolioHoldings} riskLevel={user?.riskLevel ?? 1} />
                </div>
            </BaseLayout>
        );
    }

    if (showDetailedNews) {
        return (
            <BaseLayout>
                <header className="flex items-center justify-between px-6 py-3 border-b border-border">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => setShowDetailedNews(false)}
                            className="text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                            ← Back
                        </Button>
                        <h1 className="text-xl font-bold">Market News</h1>
                    </div>
                    <Link to="/profile">
                        <Button variant="ghost" className="flex items-center gap-2">
                            <UserIcon className="h-5 w-5" />
                            Profile
                        </Button>
                    </Link>
                </header>
                <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-56px)]">
                    {newsItems.map((n) => (
                        <NewsCard
                            key={n.url}
                            stocks={[assetsMap[n.assetId]?.ticker].filter(Boolean)}
                            title={n.title}
                            timestamp={formatTimestamp(n.date)}
                            url={n.url}
                        />
                    ))}
                </div>
            </BaseLayout>
        );
    }

    if (showDetailedAlerts) {
        return (
            <BaseLayout>
                <header className="flex items-center justify-between px-6 py-3 border-b border-border">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => setShowDetailedAlerts(false)}
                            className="text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                            ← Back
                        </Button>
                        <h1 className="text-xl font-bold">Portfolio Alerts</h1>
                    </div>
                    <Link to="/profile">
                        <Button variant="ghost" className="flex items-center gap-2">
                            <UserIcon className="h-5 w-5" />
                            Profile
                        </Button>
                    </Link>
                </header>
                <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-56px)]">
                    {alerts.map((a) => {
                        const asset = assetsMap[a.assetId];
                        const msg =
                            a.type === "BUY"
                                ? "Technical indicators suggest buying opportunity"
                                : a.type === "SELL"
                                    ? "Technical indicators suggest selling opportunity"
                                    : "Technical indicators suggest no change";
                        return (
                            <AlertCard
                                key={a.assetId + a.date}
                                stock={asset?.ticker ?? ""}
                                message={msg}
                                timestamp={formatTimestamp(a.date)}
                            />
                        );
                    })}
                </div>
            </BaseLayout>
        );
    }

    /* ------------------------------------------------------------------
     *  MAIN DASHBOARD (fits 768-px screens without page scroll)
     * ----------------------------------------------------------------*/
    return (
        <BaseLayout>
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-3 border-b border-border">
                <div>
                    <h1 className="text-2xl font-bold leading-none">AutoInvestor</h1>
                    <span className="text-muted-foreground text-xs tracking-wide">
            Portfolio Management
          </span>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => setShowSimulation(true)}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1 h-8 px-3 text-sm"
                    >
                        <Play className="h-4 w-4" />
                        Simulate
                    </Button>
                    <Link to="/profile">
                        <Button
                            variant="ghost"
                            className="flex items-center gap-1 h-8 px-3 text-sm"
                        >
                            <UserIcon className="h-4 w-4" />
                            Profile
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Content area – subtract header height (56 px) from viewport */}
            <div className="p-4 lg:p-6 h-[calc(100vh-56px)]">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
                    {/* -------------------- MAIN (Holdings) -------------------- */}
                    <Card className="bg-card border-border lg:col-span-2 flex flex-col min-h-0 h-full">
                        <CardHeader className="pb-2">
                            <CardTitle>Your Holdings</CardTitle>
                        </CardHeader>
                        {/* The table scrolls internally if it overflows */}
                        <CardContent className="flex-1 min-h-0 overflow-y-auto">
                            <AssetTable
                                holdings={portfolioHoldings}
                                assetsMap={assetsMap}
                                onUpdate={async (h) => {
                                    await portfolioService.updateHolding(h);
                                    setPortfolioHoldings(
                                        await portfolioService.getPortfolioHoldings()
                                    );
                                }}
                                onDelete={async (id) => {
                                    await portfolioService.deleteHolding(id);
                                    setPortfolioHoldings(
                                        await portfolioService.getPortfolioHoldings()
                                    );
                                }}
                            />
                        </CardContent>
                    </Card>

                    {/* -------------------- SIDEBAR -------------------- */}
                    <div className="flex flex-col gap-4 h-full">
                        {/* Quick Actions */}
                        <Card className="bg-card border-border flex flex-col">
                            <CardHeader className="pb-2">
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto">
                                <AddAssetForm
                                    availableAssets={Object.values(assetsMap)}
                                    onAdd={async (assetId, shares, price) => {
                                        await portfolioService.createHolding({
                                            assetId,
                                            amount: shares,
                                            boughtPrice: Math.round(price * 100),
                                        });
                                        setPortfolioHoldings(
                                            await portfolioService.getPortfolioHoldings()
                                        );
                                    }}
                                />
                            </CardContent>
                        </Card>

                        {/* News */}
                        <Card
                            onClick={() => setShowDetailedNews(true)}
                            className="bg-card border-border hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                            <CardContent className="p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1 bg-primary/20 rounded">
                                            <Newspaper className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-medium">Market News</h3>
                                            <p className="text-muted-foreground text-sm">
                                                {todaysNews.length} new articles today
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                </div>
                                {latestNewsItem ? (
                                    <>
                                        <p className="text-muted-foreground text-sm line-clamp-2">
                                            Latest: {latestNewsItem.title}
                                        </p>
                                        <div className="flex gap-1 mt-1 flex-wrap">
                                            {latestNewsTickers.map((t) => (
                                                <Badge
                                                    key={t}
                                                    variant="secondary"
                                                    className="text-[10px]"
                                                >
                                                    {t}
                                                </Badge>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-muted-foreground text-sm">
                                        No news available
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Alerts */}
                        <Card
                            onClick={() => setShowDetailedAlerts(true)}
                            className="bg-card border-border hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                            <CardContent className="p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1 bg-destructive/20 rounded">
                                            <AlertTriangle className="h-4 w-4 text-destructive" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-medium">
                                                Portfolio Alerts
                                            </h3>
                                            <p className="text-muted-foreground text-sm">
                                                {recentAlerts.length} alerts in the last day
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                </div>
                                {latestAlert ? (
                                    <>
                                        <p className="text-muted-foreground text-sm line-clamp-2">
                                            Latest:{" "}
                                            {latestAlert.type === "BUY"
                                                ? "Buy opportunity"
                                                : latestAlert.type === "SELL"
                                                    ? "Sell opportunity"
                                                    : "No change"}
                                        </p>
                                        <div className="flex gap-1 mt-1 flex-wrap">
                                            {latestAlertsTickers.map((t) => (
                                                <Badge
                                                    key={t}
                                                    variant="secondary"
                                                    className="text-[10px]"
                                                >
                                                    {t}
                                                </Badge>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-muted-foreground text-sm">
                                        No alerts available
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </BaseLayout>
    );
}
