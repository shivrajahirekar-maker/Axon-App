import { motion } from "framer-motion";

interface PlanLoaderProps {
  stage: "loader" | "popup";
}

/** Post-onboarding transition after the last chapter: a brief spinner, then a
 * short calm popup, before the app moves on to the Final welcome screen. */
export function PlanLoader({ stage }: PlanLoaderProps) {
  return (
    <motion.div
      className="overlay-scrim"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {stage === "loader" ? (
        <div className="loader-spinner" role="status" aria-label="Setting up your plan" />
      ) : (
        <motion.div
          className="celebrate-card"
          initial={{ scale: 0.88, opacity: 0, y: 8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
        >
          <p className="celebrate-text">Your plan is coming together.</p>
          <p className="celebrate-subtext">We're setting up your first steps.</p>
        </motion.div>
      )}
    </motion.div>
  );
}
