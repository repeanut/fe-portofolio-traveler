import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, X } from 'lucide-react';
import ChatContainer from '../AIchatbot/ChatContainer';

export type ShopItem = {
    _id: string;
    id?: string; // For backward compatibility
    title: string;
    imageSrc: string;
    price: string;
    deliveryTime?: string;
    serviceCategory?: string;
};

type ShopCardProps = {
    item: ShopItem;
};

export const ShopCard: React.FC<ShopCardProps> = ({ item }) => {
    const navigate = useNavigate();
    const [showChatModal, setShowChatModal] = useState(false);
    
    // Debug logging
    console.log('🛍️ ShopCard received item:', item);
    console.log('📋 ShopCard item._id:', item._id);
    console.log('💰 ShopCard item.price:', item.price);

    const handleClick = () => {
        navigate(`/work/shop/${item._id}`, { state: { item } });
    };

    const parsePrice = (price: string): number => {
        const numeric = Number(price.replace(/[^0-9.]/g, ''));
        return Number.isNaN(numeric) ? 0 : numeric;
    };

    const basePrice = parsePrice(item.price);
    const fromPriceValue = basePrice > 0 ? Math.max(1, Math.round((basePrice / 1000) * 500)) : 0;
    const fromPriceDisplay = fromPriceValue > 0 ? `$${fromPriceValue}` : item.price;

    const handleChatClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowChatModal(true);
    };

    const handleCloseChat = () => {
        setShowChatModal(false);
    };

    return (
        <>
            <article
                onClick={handleClick}
                className="flex h-full flex-col rounded-3xl border border-gray-300 bg-white shadow-lg hover:shadow-xl transition-shadow duration-150 cursor-pointer overflow-hidden p-4"
            >
                <div className="relative w-full aspect-[3/2]">
                    <img
                        src={item.imageSrc}
                        alt={item.title}
                        className="absolute inset-0 h-full w-full object-cover rounded-xl"
                    />
                    {/* Chat Button */}
                    <button
                        onClick={handleChatClick}
                        className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-colors z-10"
                        title="Chat about this service"
                    >
                        <MessageCircle className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-1 px-5 pt-4 pb-4 flex flex-col justify-between">
                    <p className="text-sm text-gray-900 leading-snug min-h-[2.5rem] max-h-[2.5rem] overflow-hidden">
                        {item.title}
                    </p>

                    <div className="mt-4 flex items-baseline gap-1 text-gray-900">
                        <span className="text-xs text-gray-500">From</span>
                        <span className="text-xl font-bold">{fromPriceDisplay}</span>
                    </div>
                </div>
            </article>

            {/* Chat Modal */}
            {showChatModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-sky-500 to-blue-600 text-white">
                            <div>
                                <h3 className="font-semibold">Chat about: {item.title}</h3>
                                <p className="text-sm opacity-90">From {fromPriceDisplay}</p>
                            </div>
                            <button
                                onClick={handleCloseChat}
                                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Chat Container */}
                        <div className="flex-1 overflow-hidden">
                            <ChatContainer
                                key={`chat-${item._id}`}
                                showActions={false}
                                showHeader={false}
                                senderRole="user"
                                chatMode="cs"
                                theme="light"
                                enableSocket={true}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
