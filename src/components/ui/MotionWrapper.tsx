import React from "react";
import { motion } from "framer-motion";

interface MotionWrapperProps {
    children: React.ReactNode;
    delay?: number;
    variant?: "fade" | "slideUp" | "zoom" | "slideRight";
    className?: string;
    viewport?: { once: boolean; margin: string };
}

const variantsMap = {
    fade: {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    },
    slideUp: {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 },
    },
    slideRight: {
        hidden: { opacity: 0, x: -30 },
        visible: { opacity: 1, x: 0 },
    },
    zoom: {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 },
    },
};

export const MotionWrapper: React.FC<MotionWrapperProps> = ({
    children,
    delay = 0,
    variant = "slideUp",
    className = "",
    viewport = { once: true, margin: "-50px" },
}) => {
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={variantsMap[variant]}
            transition={{ duration: 0.5, delay, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
};
