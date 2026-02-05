import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

const ABOUT_STORAGE_KEY = "landing_about";

type AboutContent = {
    id: number;
    image: string;
    description: string;
    experience?: string[];
    exp1Value?: string;
    exp1Label?: string;
    exp2Value?: string;
    exp2Label?: string;
}

const parseExperienceTag = (raw: string) => {
    const text = (raw ?? "").trim();
    if (!text) return { value: "", label: "" };
    const parts = text.split(/\s+/);
    const value = parts[0] ?? "";
    const label = parts.slice(1).join(" ").trim();
    return { value, label };
}

const AboutSection: React.FC = () => {
    const navigate = useNavigate()

    const about = useMemo<AboutContent>(() => {
        const fallback: AboutContent = {
            id: 1,
            image: "/rizwords-nomad.jpg",
            description:
                "With over 5 years of experience and a deep understanding of copywriting psychology, marketing funnel, stages of awareness, and market sophistication I'll connect your brand with your target audience's pain points through ads and content. Then present your product as the perfect solution for their problems.",
            exp1Value: "5+",
            exp1Label: "Years Experience",
            exp2Value: "100+",
            exp2Label: "Projects",
        };

        try {
            const raw = localStorage.getItem(ABOUT_STORAGE_KEY);
            const parsed = raw ? (JSON.parse(raw) as unknown) : null;
            if (Array.isArray(parsed) && parsed.length > 0) return parsed[0] as AboutContent;
        } catch {
            // ignore
        }

        return fallback;
    }, []);

    const experienceItems = useMemo(() => {
        const fromTags = Array.isArray(about.experience) ? about.experience : [];
        const legacy = [
            [about.exp1Value, about.exp1Label].filter(Boolean).join(" ").trim(),
            [about.exp2Value, about.exp2Label].filter(Boolean).join(" ").trim(),
        ].filter((x) => x);

        const tags = (fromTags.length ? fromTags : legacy).filter((x) => (x ?? "").trim());
        const list = tags.map(parseExperienceTag).filter((x) => x.value || x.label);
        if (list.length >= 2) return list.slice(0, 2);

        return [
            { value: about.exp1Value ?? "5+", label: about.exp1Label ?? "Years Experience" },
            { value: about.exp2Value ?? "100+", label: about.exp2Label ?? "Projects" },
        ];
    }, [about]);

    return (
        <section id="about" className="py-14 md:py-20 bg-white overflow-hidden mt-10 md:mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">

                    {/* Left Column */}
                    <div className="relative w-full md:w-2/5 flex justify-center items-center">
                        <div className="relative w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] md:w-[350px] md:h-[350px] z-0">

                            {/* Layer 1 */}
                            <div className="absolute top-0 right-[-10%] w-full h-full bg-[#E0F2FE] rounded-full z-0 pointer-events-none" />

                            {/* Layer 2 */}
                            <div className="absolute inset-0 m-auto w-full h-full rounded-full border border-cyan-400/80 scale-[1.03] z-10 pointer-events-none rotate-[-12deg] left-[-10%] -mt-4">
                                {/* Planet 1 */}
                                <div className="absolute top-[10%] right-[-4%] w-16 h-16 md:w-20 md:h-20 bg-cyan-400 rounded-full shadow-md" />

                                {/* Planet 2 */}
                                <div className="absolute top-[50%] -left-[3%] w-6 h-6 bg-cyan-400 rounded-full shadow-sm" />

                                {/* Planet 3 */}
                                <div className="absolute bottom-[23%] left-[0%] w-8 h-8 md:w-9 md:h-9 bg-cyan-300 rounded-full shadow-sm" />
                            </div>

                            {/* Layer 3 */}
                            <div className="relative w-full h-full rounded-full overflow-hidden z-10">
                                <img
                                    src={about.image || "/rizwords-nomad.jpg"}
                                    alt="Working in Bali"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="w-full md:w-3/5 text-center md:text-left">
                        <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
                            Why You <span className="text-sky-500">Hire Me</span> for <br />
                            Your Next Projects?
                        </h2>

                        <p className="mt-6 text-slate-500 text-sm sm:text-base leading-relaxed mx-auto md:mx-0 max-w-2xl">
                            {about.description}
                        </p>

                        {/* Stats Pills */}
                        <div className="mt-8 grid grid-cols-2 gap-3 max-w-md mx-auto md:max-w-none md:mx-0 md:flex md:flex-wrap md:gap-4 md:justify-start">
                            <div className="bg-sky-50 px-4 py-2 rounded-full flex items-center justify-center gap-2 w-full md:w-fit">
                                <span className="text-sky-500 text-xl font-bold">{experienceItems[0]?.value ?? "5+"}</span>
                                <span className="text-slate-700 font-medium text-sm">{experienceItems[0]?.label ?? "Years Experience"}</span>
                            </div>
                            <div className="bg-sky-50 px-4 py-2 rounded-full flex items-center justify-center gap-2 w-full md:w-fit">
                                <span className="text-sky-500 text-xl font-bold">{experienceItems[1]?.value ?? "100+"}</span>
                                <span className="text-slate-700 font-medium text-sm">{experienceItems[1]?.label ?? "Projects"}</span>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <div className="mt-8 flex justify-center md:justify-start">
                            <button
                                onClick={() => navigate('/work/shop')}
                                className="px-8 py-3 rounded-full border-2 border-sky-500 text-sm text-sky-500 font-semibold hover:bg-sky-500 hover:text-white transition-colors duration-300"
                            >
                                Hire Me
                            </button>
                        </div>

                    </div>

                </div>
            </div>
        </section>
    )
}

export default AboutSection
