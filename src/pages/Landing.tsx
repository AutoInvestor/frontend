import Hero from "@/components/landpage/Hero.tsx";
import DashboardPreview from "@/components/landpage/DashboardPreview.tsx";


function Landing() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center">
            <main className="max-w-7xl mx-auto px-6 py-8 w-full">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Side - Main Content */}
                    <div className="space-y-8">
                        <Hero />
                    </div>

                    {/* Right Side - Dashboard Preview */}
                    <div>
                        <DashboardPreview />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Landing;