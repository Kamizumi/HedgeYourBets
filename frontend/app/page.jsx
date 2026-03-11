import { auth } from "@/auth";
import Link from 'next/link';
// Import client components
import RotatingHeroBackground from "@/components/RotatingHeroBg"; 
import BettingForm from "@/components/BettingForm"; 
import ContentRow from "@/components/ContentRow"; 


// --- STATIC DATA ARRAYS ---
// Each card object now includes two image paths: one for the card display (thumbnail) 
// and one for the high-resolution modal view (modalImagePath).
const analyzeBetCards = [
    { thumbnailImagePath: "/images/bet_template_card.png", modalImagePath: "/images/bet_template_og.png" }, 
    { thumbnailImagePath: "/images/bet_two_card.png", modalImagePath: "/images/bet_two_og.png" },
    { thumbnailImagePath: "/images/showcase_three_card.jpg", modalImagePath: "/images/showcase_three_og.jpg" },
    { thumbnailImagePath: "/images/showcase_four_og.jpg", modalImagePath: "/images/showcase_four_og.jpg" },
    { thumbnailImagePath: "/images/showcase_five_card.jpg", modalImagePath: "/images/showcase_five_og.jpg" },
    { thumbnailImagePath: "/images/showcase_six_card.jpg", modalImagePath: "/images/showcase_six_og.jpg" },
    { thumbnailImagePath: "/images/showcase_seven_card.jpg", modalImagePath: "/images/showcase_seven_og.jpg" },
];

const trendingCards = [
    { thumbnailImagePath: "/images/trending_one_card.jpg", modalImagePath: "/images/trending_one_og.jpg" }, 
    { thumbnailImagePath: "/images/trending_two_card.jpg", modalImagePath: "/images/trending_two_og.jpg" },
    { thumbnailImagePath: "/images/trending_three_card.jpg", modalImagePath: "/images/trending_three_og.jpg" },
    { thumbnailImagePath: "/images/trending_four_card.jpg", modalImagePath: "/images/trending_four_og.jpg" },
    { thumbnailImagePath: "/images/trending_five_card.jpg", modalImagePath: "/images/trending_five_og.jpg" },
    { thumbnailImagePath: "/images/trending_six_card.jpg", modalImagePath: "/images/trending_six_og.jpg" },
    { thumbnailImagePath: "/images/trending_seven_card.jpg", modalImagePath: "/images/trending_seven_og.jpg" },
];

const predictionCards = [
    { thumbnailImagePath: "/images/analysis_one_og.jpg", modalImagePath: "/images/analysis_one_og.jpg" }, 
    { thumbnailImagePath: "/images/analysis_two_card.jpg", modalImagePath: "/images/analysis_two_og.jpg" },
    { thumbnailImagePath: "/images/analysis_three_og.jpg", modalImagePath: "/images/analysis_three_og.jpg" },
    { thumbnailImagePath: "/images/analysis_four_card.jpg", modalImagePath: "/images/analysis_four_og.jpg" },
    { thumbnailImagePath: "/images/analysis_five_card.jpg", modalImagePath: "/images/analysis_five_og.jpg" },
    { thumbnailImagePath: "/images/analysis_six_card.jpg", modalImagePath: "/images/analysis_six_og.jpg" },
    { thumbnailImagePath: "/images/analysis_seven_card.jpg", modalImagePath: "/images/analysis_seven_og.jpg" },
];
// --------------------------------------------------------------------------


export default async function HomePage() {
    const session = await auth(); 
    console.log("Session in page.jsx:", session);

    if (session) {
        // --- AUTHENTICATED USER: Shows betting form (The Home Page) ---
        return (
            <div className="p-4 md:p-8 min-h-screen">
                {/* Text Section Above Betting Form */}
                <div className="mb-8 max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                        Hedge Your Bets
                    </h1>
                    <h2 className="text-xl md:text-2xl text-white/90 mb-4 font-semibold">
                        AI-Powered Sports Betting Analysis
                    </h2>
                    <p className="text-lg text-white/80 max-w-3xl mx-auto">
                        Make smarter betting decisions with our advanced analytics and machine learning insights.
                    </p>
                </div>
                <BettingForm session={session} />
            </div>
        );
    }

    // --- UNATHENTICATED USER: Shows landing page (The Marketing Page) ---
    return (
        <div className="min-h-screen">
            
            {/* 1. Rotating Hero Section */}
            <RotatingHeroBackground />
            
            {/* 2. Content Rows (Static Showcase) */}
            <div className="px-8 md:px-16 space-y-12 pb-16">
                
                <ContentRow 
                    title="Analyze Your Bet" 
                    cardDataArray={analyzeBetCards} 
                />
                
                <ContentRow 
                    title="Discover What's Trending" 
                    cardDataArray={trendingCards} 
                />

                <ContentRow 
                    title="Prediction Insights" 
                    cardDataArray={predictionCards} 
                />

            </div>
        </div>
    );
}