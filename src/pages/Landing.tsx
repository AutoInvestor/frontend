import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button.tsx";
import {ArrowRightIcon, ArrowTrendingUpIcon, ChartBarSquareIcon} from "@heroicons/react/16/solid";
import useAuth from "@/hooks/useAuth.ts";
import {Link} from "react-router-dom";
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent
} from "@/components/ui/chart.tsx";
import {Area, AreaChart, CartesianGrid, XAxis} from "recharts";
import {TrendingUp} from "lucide-react";

function Landing() {
    return (
        <div className={"w-screen h-screen bg-neutral-100"}>
            <div
                className={"w-[80%] max-w-[1200px] min-w-[200px] mx-auto h-screen flex flex-row items-center justify-center gap-5"}>
                <div className={"flex-1"}>
                    <Jumbotron/>
                </div>
                <div className={"flex-1"}>
                    <KeyFeatures/>
                </div>
            </div>
        </div>
    )
}

function Jumbotron() {
    const {isAuthenticated} = useAuth();

    return (
        <div className="flex flex-col">
            <h1 className={"text-6xl font-bold"}>Your Complete Investment Portfolio Management Solution</h1>
            <p className={"text-neutral-500 pt-8"}>Track, analyze, and optimize your investments in one powerful
                dashboard. Get real-time market insights and personalized alerts to make smarter investment
                decisions.</p>
            {!isAuthenticated
                ? <a href="/api/oauth2/authorization/okta" className={"pt-8"}>
                    <Button className="cursor-pointer">Login</Button>
                </a>
                : <Link className={"flex items-center pt-8"} to={"/dashboard"}>
                    Go to your dashboard <ArrowRightIcon className={"ms-2 inline-block size-6"}/>
                </Link>}
        </div>
    )
}

function KeyFeatures() {
    const cards = [
        {
            icon: <ChartBarSquareIcon className={"size-6"}></ChartBarSquareIcon>,
            title: "Portfolio tracking",
            description: "Monitor all your investments in real-time across stocks, ETFs, and more in a single dashboard."
        },
        {
            icon: <ArrowTrendingUpIcon className={"size-6"}></ArrowTrendingUpIcon>,
            title: "Market insights",
            description: "Get personalized market analysis and sentiment indicators to inform your investment decisions."
        }
    ]

    return (
        <>
            <div className={"grid grid-cols-2 gap-5"}>
                {cards.map((card) => (
                    <Card className={"bg-white shadow-none"}>
                        <CardHeader>
                            <div className={"rounded-full bg-neutral-200 w-fit box-border p-3"}>
                                {card.icon}
                            </div>
                            <CardTitle className={"pt-3"}>{card.title}</CardTitle>
                            <CardDescription>{card.description}</CardDescription>
                        </CardHeader>
                    </Card>
                ))}
            </div>
            <div className={"mt-5"}>
                <ChartAreaLegend></ChartAreaLegend>
            </div>
        </>
    )
}

const chartData = [
    { month: "January", desktop: 80, mobile: 80 },
    { month: "February", desktop: 205, mobile: 200 },
    { month: "March", desktop: 135, mobile: 120 },
    { month: "April", desktop: 195, mobile: 190 },
    { month: "May", desktop: 300, mobile: 130 },
    { month: "June", desktop: 500, mobile: 140 },
]

const chartConfig = {
    desktop: {
        label: "Our APPL autoinvested stock value",
        color: "hsl(var(--chart-blue-1))",
    },
    mobile: {
        label: "APPL stock value",
        color: "hsl(var(--chart-blue-2))",
    },
} satisfies ChartConfig

export function ChartAreaLegend() {
    return (
        <Card className={"shadow-none"}>
            <CardHeader>
                <CardTitle>Autoinvested APPL</CardTitle>
                <CardDescription>
                    Showing AutoInvestor APPL performance
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <AreaChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                        />
                        <Area
                            dataKey="mobile"
                            type="natural"
                            fill="var(--color-mobile)"
                            fillOpacity={0.4}
                            stroke="var(--color-mobile)"
                            stackId="a"
                        />
                        <Area
                            dataKey="desktop"
                            type="natural"
                            fill="var(--color-desktop)"
                            fillOpacity={0.4}
                            stroke="var(--color-desktop)"
                            stackId="a"
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
            <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                    <div className="grid gap-2">
                        <div className="flex items-center gap-2 leading-none font-medium">
                            Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                        </div>
                        <div className="text-muted-foreground flex items-center gap-2 leading-none">
                            January - June 2024
                        </div>
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}

export default Landing;