import React, { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

interface FAQItem {
    question: string
    answer: string
}

const faqs: FAQItem[] = [
    {
        question: 'Apa saja layanan copywriting yang ditawarkan?',
        answer: 'Saya menawarkan berbagai layanan copywriting termasuk video script, brand storytelling, email campaigns, content marketing, social media copy, product description, landing page copy, ads copy, dan SEO content.'
    },
    {
        question: 'Berapa lama waktu pengerjaan proyek?',
        answer: 'Waktu pengerjaan bervariasi tergantung kompleksitas proyek. Untuk proyek kecil seperti social media copy biasanya 2-3 hari kerja, sedangkan untuk proyek besar seperti brand storytelling bisa memakan waktu 1-2 minggu.'
    },
    {
        question: 'Bagaimana cara memesan jasa copywriting?',
        answer: 'Anda bisa menghubungi saya melalui form kontak di website ini atau langsung melalui email/WhatsApp. Setelah itu kita akan berdiskusi tentang kebutuhan proyek Anda dan saya akan memberikan quotation.'
    },
    {
        question: 'Apakah ada revisi untuk setiap proyek?',
        answer: 'Ya, setiap proyek mendapatkan hingga 2 kali revisi gratis. Revisi tambahan dapat didiskusikan dengan biaya yang disepakati bersama.'
    },
    {
        question: 'Bagaimana sistem pembayaran yang berlaku?',
        answer: 'Pembayaran dilakukan dengan sistem 50% di awal sebagai DP dan 50% setelah proyek selesai. Untuk proyek besar, pembayaran bisa dibagi menjadi beberapa termin sesuai kesepakatan.'
    },
    {
        question: 'Apakah bisa konsultasi dulu sebelum order?',
        answer: 'Tentu! Saya menyediakan konsultasi gratis untuk membahas kebutuhan proyek Anda. Silakan hubungi saya untuk menjadwalkan sesi konsultasi.'
    }
]

const FAQSection: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    return (
        <section className="py-20" id="faq">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Column - Title & Illustration */}
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-semibold text-slate-800">
                                Frequently asked{' '}
                                <span className="text-sky-500">questions!</span>
                            </h2>
                            <p className="text-gray-500 mt-4 max-w-md">
                                Ready to elevate your brand narrative? Drop me a distinct message.
                            </p>
                        </div>

                        {/* Illustration */}
                        <div className="flex justify-center lg:justify-start">
                            <img
                                src="/illustration.png"
                                alt="FAQ Illustration"
                                className="w-120 h-auto object-contain"
                            />
                        </div>
                    </div>

                    {/* Right Column - FAQ Accordion */}
                    <div className="space-y-0 p-4 rounded-xl bg-white shadow-lg">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="border-b border-gray-200"
                            >
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full py-5 flex items-center justify-between text-left transition-colors"
                                >
                                    <span className="text-slate-800 font-medium text-sm md:text-base pr-4">
                                        {faq.question}
                                    </span>
                                    <span className="flex-shrink-0 text-gray-400">
                                        {openIndex === index ? (
                                            <Minus className="w-5 h-5" />
                                        ) : (
                                            <Plus className="w-5 h-5" />
                                        )}
                                    </span>
                                </button>

                                {/* Answer - Collapsible */}
                                <div
                                    className={`overflow-hidden transition-all ml-5 duration-300 ease-in-out ${openIndex === index ? 'max-h-96 pb-5' : 'max-h-0'
                                        }`}
                                >
                                    <p className="text-gray-500 text-sm leading-relaxed pr-8">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default FAQSection
