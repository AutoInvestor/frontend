import {Card, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button.tsx";
import {
    ArrowTrendingUpIcon, BanknotesIcon,
    BellIcon,
    ChartBarSquareIcon,
    LightBulbIcon, StarIcon,
    UserCircleIcon,
    WalletIcon
} from "@heroicons/react/16/solid";
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "@/components/ui/carousel.tsx";
import {Separator} from "@/components/ui/separator.tsx";

function Landing() {
    return (
        <>
            <div className={"w-[80%] max-w-[1200px] min-w-[200px] mx-auto"}>
                <Jumbotron />
                <Separator className="mt-16" />
                <KeyFeatures />
                <HowItWorks />
                <PricingPlans />
                <UsersFeedback />
                <Closing />
            </div>
        </>
    )
}

function Jumbotron() {
    return (
        <>
            <div className="flex flex-wrap py-16">
                <div className="w-full lg:w-1/2 break-words">
                    <h1 className={"text-6xl font-bold"}>Your Complete Investment Portfolio Management Solution</h1>
                </div>
                <div className="w-full lg:w-1/2 box-border ps-0 pt-8 lg:ps-8">
                    <p className={"text-neutral-500"}>Track, analyze, and optimize your investments in one powerful dashboard. Get real-time market insights and personalized alerts to make smarter investment decisions.</p>
                </div>
            </div>
            <a href="/api/oauth2/authorization/okta"><Button className="cursor-pointer">Start free trial</Button></a>
        </>
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
        },
        {
            icon: <BellIcon className={"size-6"}></BellIcon>,
            title: "Smart alerts",
            description: "Receive timely notifications about market changes, price movements, and investment opportunities."
        }
    ]

    return (
        <>
            <h2 className={"text-center text-4xl font-bold py-6 mt-6"}>Key features</h2>
            <div className={"flex flex-col md:flex-row gap-x-2 gap-y-2 md:items-start"}>
                {cards.map((card) => (
                    <Card className={"md:flex-1 bg-neutral-100 shadow-none border-none"}>
                        <CardHeader>
                            <div className={"rounded-full bg-neutral-200 w-fit box-border p-3"}>
                                {card.icon}
                            </div>
                            <CardTitle className={"pt-3"}>{card.title}</CardTitle>
                            <CardDescription>{card.description}</CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button>Learn more</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </>
    )
}

function HowItWorks() {
    const items = [
        {
            icon: <UserCircleIcon className={"size-6"}></UserCircleIcon>,
            title: "Connect Your Accounts",
            description: "Securely link your investment accounts for a comprehensive overview"
        },
        {
            icon: <WalletIcon className={"size-6"}></WalletIcon>,
            title: "Customize Your Dashboard",
            description: "Set up your preferences and watchlists to focus on what matters to you"
        },
        {
            icon: <ArrowTrendingUpIcon className={"size-6"}></ArrowTrendingUpIcon>,
            title: "Track Performance",
            description: "Monitor your portfolio performance with detailed analytics and visualizations"
        },
        {
            icon: <LightBulbIcon className={"size-6"}></LightBulbIcon>,
            title: "Make Informed Decisions",
            description: "Use our insights and recommendations to optimize your investment strategy"
        }
    ]

    return (
        <>
            <h2 className={"text-center text-4xl font-bold py-6 mt-6"}>How it works</h2>
            <div className={"flex gap-y-4 flex-col"}>
                {items.map((item) => (
                    <div className={"flex flex-row items-center"}>
                        <div className={"rounded-xl bg-neutral-100 w-fit box-border p-3"}>
                            {item.icon}
                        </div>
                        <div className={"ps-4"}>
                            <p>{item.title}</p>
                            <p className={"font-light text-neutral-500"}>{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}

function PricingPlans() {
    return (
        <>
            <h2 className={"text-center text-4xl font-bold py-6 mt-6"}>How it works</h2>
            <div className={"flex flex-col sm:flex-row gap-x-2 gap-y-2"}>
                <Card className={"flex-1 bg-neutral-100 shadow-none border-none"}>
                    <CardHeader>
                        <div className={"rounded-full bg-neutral-200 w-fit box-border p-3"}>
                            <BanknotesIcon className={"size-6"}></BanknotesIcon>
                        </div>
                        <CardDescription className={"text-black pt-3"}>$0/month</CardDescription>
                        <CardTitle>Free</CardTitle>
                        <CardDescription>Basic portfolio tracking and market insights for individual investors.</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button>Get started</Button>
                    </CardFooter>
                </Card>
                <Card className={"flex-1 bg-neutral-100 shadow-none border-none"}>
                    <CardHeader>
                        <div className={"rounded-full bg-neutral-200 w-fit box-border p-3"}>
                            <StarIcon className={"size-6"}></StarIcon>
                        </div>
                        <CardDescription className={"text-black pt-3"}>$29/month</CardDescription>
                        <CardTitle>Pro</CardTitle>
                        <CardDescription>Advanced analytics, real-time alerts, and personalized recommendations for serious investors.</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button>Start free trial</Button>
                        <Button variant="secondary" className={"bg-neutral-200 hover:bg-neutral-300 ms-2"}>Learn more</Button>
                    </CardFooter>
                </Card>
            </div>
        </>
    )
}


function UsersFeedback() {
    const opinions = [
        {
            jobTitle: "Retail investor",
            title: "Sarah Johnson",
            description: "AutoInvestor has completely transformed how I manage my investments. The real-time insights and alerts have helped me make better decisions and increase my returns."
        },
        {
            jobTitle: "Financial advisor",
            title: "Michael Chen",
            description: "As a financial advisor, I rely on AutoInvestor daily to track multiple client portfolios. The comprehensive analytics and customizable dashboards save me hours of work every week."
        },
        {
            jobTitle: "Day Trader",
            title: "James Miller",
            description: "AutoInvestor's real-time data feeds and predictive analytics have given me an edge in the market. The AI-driven alerts help me act fast on opportunities I would have otherwise missed."
        },
        {
            jobTitle: "Long-Term Investor",
            title: "Emily Davis",
            description: "I used to spend hours researching and analyzing stocks, but AutoInvestor has simplified the process. The portfolio optimization tools have helped me build a more balanced and profitable portfolio."
        },
        {
            jobTitle: "Wealth Manager",
            title: "Robert Thompson",
            description: "Managing high-net-worth clients requires precision and efficiency. AutoInvestor provides me with detailed reports and real-time insights, making my job much easier and my clients happier."
        },
        {
            jobTitle: "Crypto Enthusiast",
            title: "Sophia Lee",
            description: "AutoInvestor isn’t just great for traditional investments—it’s also a game-changer for crypto traders. The AI-driven risk assessment tools have helped me navigate the volatile market with more confidence."
        },
        {
            jobTitle: "Casual Investor",
            title: "Daniel White",
            description: "I’m not a professional investor, but AutoInvestor makes it easy for me to stay on top of market trends and make smart choices without spending hours analyzing data."
        }
    ]

    return (
        <>
            <h2 className={"text-center text-4xl font-bold py-6 mt-6"}>What our users say</h2>
            <Carousel className="w-full">
                <CarouselContent>
                    {opinions.map((opinion) => (
                        <CarouselItem className={"sm:basis-1/2 md:basis-1/3"}>
                            <div className="p-1">
                                <Card className={"bg-neutral-100 shadow-none border-none"}>
                                    <CardHeader>
                                        <CardDescription className={"text-black"}>{opinion.jobTitle}</CardDescription>
                                        <CardTitle>{opinion.title}</CardTitle>
                                        <CardDescription>{opinion.description}</CardDescription>
                                    </CardHeader>
                                </Card>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        </>
    )
}

function Closing() {
    return (
        <>
            <h2 className={"text-center text-4xl font-bold py-6 mt-6"}>
                Ready to optimize your investment strategy?
            </h2>
            <div className={"w-full flex justify-center"}>
                <Button>Start your free trial today</Button>
            </div>
            <p className={"text-center text-neutral-500 pt-6 mb-16"}>No credit card required. 14-day free trial.</p>
        </>
    )
}

export default Landing;