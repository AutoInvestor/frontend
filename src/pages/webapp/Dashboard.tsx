import {Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow,} from "@/components/ui/table"

const invoices = [
    {
        ticker: "APPL",
        shares: 234,
        valuePerShare: 25034,
        change: -300,
    },
    {
        ticker: "AMZN",
        shares: 23,
        valuePerShare: 1223,
        change: 100,
    },
    {
        ticker: "IDTX",
        shares: 45,
        valuePerShare: 8504,
        change: 50,
    },
    {
        ticker: "NVDA",
        shares: 134,
        valuePerShare: 33912,
        change: -63,
    }
]

function Dashboard() {
    return (
        <>
            <div>
                <Summary />
                <div className={"mt-5"}>
                    <Portfolio />
                </div>
            </div>
        </>
    )
}

function Summary() {
    return(
        <>
        </>
    )
}

function Portfolio() {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">Ticker</TableHead>
                    <TableHead>Shares</TableHead>
                    <TableHead>Value per share</TableHead>
                    <TableHead>Total value</TableHead>
                    <TableHead className="text-right">Change (%)</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {invoices.map((invoice) => (
                    <TableRow key={invoice.ticker}>
                        <TableCell className="font-medium">{invoice.ticker}</TableCell>
                            <TableCell>{invoice.shares}</TableCell>
                        <TableCell>${invoice.valuePerShare / 100}</TableCell>
                        <TableCell>${(invoice.shares * invoice.valuePerShare) / 100}</TableCell>
                        <TableCell className="text-right">{invoice.change / 100}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell colSpan={3}>Total</TableCell>
                    <TableCell>${invoices.map(invoice => (invoice.shares * invoice.valuePerShare) / 100).reduce((previous, current) => previous + current).toFixed(2)}</TableCell>
                    <TableCell className="text-right">3%</TableCell>
                </TableRow>
            </TableFooter>
        </Table>
    )
}

export default Dashboard;