

export const bounceVariants = {
  animate: {
    y: [0, -15, 0],
    scale: [1, 1.05, 1],
    transition: {
      y: {
        repeat: Infinity,
        repeatType: "loop",
        duration: 1.5,
        ease: "easeInOut",
      },
      scale: {
        repeat: Infinity,
        repeatType: "loop",
        duration: 1.5,
        ease: "easeInOut",
      },
    },
  },
};

