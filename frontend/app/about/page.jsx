import Link from 'next/link';

export const metadata = {
	title: "About Us - Hedge Your Bets",
	description:
		"Learn about our mission to revolutionize sports betting with AI and data science",
};

export default function AboutPage() {
	const teamMembers = [
		{
			name: "Jason",
			role: "Full Stack Developer",
			description:
				"Passionate about creating innovative betting analysis tools with modern web technologies.",
			emoji: "👨‍💻",
			linkedin: "https://www.linkedin.com/in/jason-mar-b0bb8a268/",
		},
		{
			name: "Tony Gonzalez",
			role: "Machine Learning Engineer",
			description:
				"Creating advanced machine learning systems that process vast amounts of sports data to deliver reliable betting predictions and risk assessments.",
			emoji: "👷",
			linkedin: "https://www.linkedin.com/in/antoniogonzalez9868/",
		},
		{
			name: "Timothy Tsang",
			role: "Full Stack Developer",
			description: 
				"Developing intuitive, high performance interfaces and backend infrastructure to translate complex betting data into actionable insights.",
			emoji: "👨‍🔧" ,
			linkedin: "https://www.linkedin.com/in/timothy-tsang-7b39162b1/"
		},
		{
			name: "Michael Castillo",
			role: "Backend Developer",
			description:
				"Building robust server infrastructure and APIs that power seamless data flow between machine learning models and user-facing features.",
			emoji: "👨‍🔬",
		},
	];

	const features = [
		{
			title: "AI-Powered Analysis",
			description:
				"Our machine learning algorithms analyze player statistics, team performance, and historical data to provide accurate betting recommendations.",
			icon: "🧠",
			color: "from-blue-500 to-cyan-500",
		},
		{
			title: "Real-Time Data",
			description:
				"Access up-to-date player stats, injury reports, and team news to make informed betting decisions.",
			icon: "⚡",
			color: "from-purple-500 to-pink-500",
		},
		{
			title: "Risk Management",
			description:
				"Advanced risk assessment tools help you understand the potential outcomes and manage your betting portfolio.",
			icon: "🛡️",
			color: "from-green-500 to-teal-500",
		},
		{
			title: "User-Friendly Interface",
			description:
				"Clean, modern design makes it easy to create betting scenarios and understand complex analytics.",
			icon: "🎨",
			color: "from-orange-500 to-red-500",
		},
	];

	return (
		<>
			{/* Hero Section */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
				<div className="text-center">
					<h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
						About Hedge Your Bets
					</h1>
					<p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto">
						We're revolutionizing sports betting with artificial
						intelligence and data science
					</p>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
				<div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
					<div className="p-8 md:p-12">
						<div className="max-w-4xl mx-auto">
							<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
								Our Mission
							</h2>
							<p className="text-lg md:text-xl text-gray-600 leading-relaxed text-center mb-12">
								At Hedge Your Bets, we believe that sports
								betting should be informed, strategic, and
								data-driven. Our platform combines advanced
								machine learning algorithms with comprehensive
								sports analytics to help users make smarter
								betting decisions. We're not just another
								betting platform, we're your intelligent
								betting partner.
							</p>

							{/* Features Grid */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
								{features.map((feature, index) => (
									<div key={index} className="group">
										<div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
											<div
												className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
											>
												<span className="text-2xl">
													{feature.icon}
												</span>
											</div>
											<h3 className="text-xl font-bold text-gray-900 mb-3">
												{feature.title}
											</h3>
											<p className="text-gray-600 leading-relaxed">
												{feature.description}
											</p>
										</div>
									</div>
								))}
							</div>

							{/* Team Section */}
							<div className="text-center">
								<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
									Meet Our Team
								</h2>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
									{teamMembers.map((member, index) => (
										<div key={index} className="group">
											{member.linkedin ? (
												<Link 
													href={member.linkedin}
													target="_blank"
													rel="noopener noreferrer"
													className="block cursor-pointer"
												>
													<div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
														<div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
															{member.emoji}
														</div>
														<h3 className="text-xl font-bold text-gray-900 mb-2">
															{member.name}
														</h3>
														<p className="text-blue-600 font-semibold mb-4">
															{member.role}
														</p>
														<p className="text-gray-600 leading-relaxed">
															{member.description}
														</p>
													</div>
												</Link>
											) : (
												<div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
													<div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
														{member.emoji}
													</div>
													<h3 className="text-xl font-bold text-gray-900 mb-2">
														{member.name}
													</h3>
													<p className="text-blue-600 font-semibold mb-4">
														{member.role}
													</p>
													<p className="text-gray-600 leading-relaxed">
														{member.description}
													</p>
												</div>
											)}
										</div>
									))}
								</div>
							</div>

							{/* Technology Stack */}
							<div className="mt-16 text-center">
								<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
									Technology Stack
								</h2>
								<div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
									<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
										<div className="text-center">
											<div className="text-3xl mb-2">
												⚛️
											</div>
											<p className="font-semibold text-gray-800">
												React
											</p>
											<p className="text-sm text-gray-600">
												Frontend
											</p>
										</div>
										<div className="text-center">
											<div className="text-3xl mb-2">
												🔥
											</div>
											<p className="font-semibold text-gray-800">
												Next.js
											</p>
											<p className="text-sm text-gray-600">
												Framework
											</p>
										</div>
										<div className="text-center">
											<div className="text-3xl mb-2">
												🐍
											</div>
											<p className="font-semibold text-gray-800">
												Python
											</p>
											<p className="text-sm text-gray-600">
												Backend
											</p>
										</div>
										<div className="text-center">
											<div className="text-3xl mb-2">
												🤖
											</div>
											<p className="font-semibold text-gray-800">
												LightGBM/Scikit-Learn
											</p>
											<p className="text-sm text-gray-600">
												Machine Learning
											</p>
										</div>
									</div>
								</div>
							</div>

							{/* Call to Action */}
							<div className="mt-16 text-center">
								<div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
									<h2 className="text-2xl md:text-3xl font-bold mb-4">
										Ready to Start Your Betting Journey?
									</h2>
									<p className="text-blue-100 mb-6 text-lg">
										Join thousands of users who are already
										making smarter betting decisions with
										our AI-powered platform.
									</p>
									<Link 
										href="/get-started"
										className="inline-block bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
									>
										Get Started Today
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
