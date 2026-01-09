"use client";

import React, { useState, useEffect, Children, isValidElement } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CardSwapProps {
    children: React.ReactNode;
    cardDistance?: number;
    verticalDistance?: number;
    delay?: number;
    pauseOnHover?: boolean;
}

export const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
    return <div className={`w-full h-full ${className}`}>{children}</div>;
};

const CardSwap = ({
    children,
    cardDistance = 60,
    verticalDistance = 70,
    delay = 5000,
    pauseOnHover = true,
}: CardSwapProps) => {
    const [cards, setCards] = useState<React.ReactNode[]>([]);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        setCards(Children.toArray(children));
    }, [children]);

    useEffect(() => {
        if (pauseOnHover && isHovered) return;
        if (cards.length <= 1) return;

        const interval = setInterval(() => {
            setCards((prev) => {
                const newCards = [...prev];
                const first = newCards.shift();
                if (first) newCards.push(first);
                return newCards;
            });
        }, delay);

        return () => clearInterval(interval);
    }, [cards.length, delay, pauseOnHover, isHovered]);

    const moveCard = () => {
        setCards((prev) => {
            const newCards = [...prev];
            const first = newCards.shift();
            if (first) newCards.push(first);
            return newCards;
        });
    };

    return (
        <div
            className="relative w-full h-full flex items-center justify-center perspective-1000 cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={moveCard}
        >
            <div className="relative w-full h-full">
                <AnimatePresence mode="popLayout">
                    {cards.map((card, index) => {
                        // Limit visible cards
                        if (index > 2) return null;

                        // Extract key safely
                        const key = isValidElement(card) ? card.key : index;

                        return (
                            <motion.div
                                key={key}
                                layout
                                initial={{
                                    y: -verticalDistance,
                                    scale: 0.9,
                                    opacity: 0,
                                    zIndex: 0
                                }}
                                animate={{
                                    y: index * (verticalDistance / 3) * -1,
                                    scale: 1 - index * 0.05,
                                    opacity: index === 0 ? 1 : 1 - index * 0.3,
                                    zIndex: cards.length - index,
                                    filter: index === 0 ? "blur(0px)" : "blur(2px)"
                                }}
                                exit={{
                                    y: verticalDistance,
                                    opacity: 0,
                                    scale: 0.8,
                                    zIndex: -1,
                                    transition: { duration: 0.3 }
                                }}
                                transition={{
                                    duration: 0.5,
                                    ease: "easeInOut"
                                }}
                                className="absolute inset-0 w-full h-full"
                            >
                                {card}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CardSwap;
