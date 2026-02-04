import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
    value: string;
    size?: number;
    className?: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ 
    value, 
    size = 192, 
    className = '' 
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const generateQRCode = async () => {
            if (!canvasRef.current || !value) return;

            try {
                setError(null);
                await QRCode.toCanvas(canvasRef.current, value, {
                    width: size,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    },
                    errorCorrectionLevel: 'M'
                });
            } catch (err) {
                console.error('Error generating QR code:', err);
                setError('Failed to generate QR code');
            }
        };

        generateQRCode();
    }, [value, size]);

    if (error) {
        return (
            <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
                <div className="text-center">
                    <div className="text-gray-400 mb-2">
                        <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-sm text-gray-500">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex items-center justify-center bg-white rounded-lg ${className}`}>
            <canvas 
                ref={canvasRef} 
                style={{ width: size, height: size }}
                className="rounded-lg"
            />
        </div>
    );
};

export default QRCodeDisplay;
