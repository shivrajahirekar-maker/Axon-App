import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface ChapterCelebrationProps {
  chapterTitle: string;
}

/** Brief, auto-dismissing celebration overlay shown right after a chapter's
 * last question — not a pushed screen, just a transient toast over the Trail
 * Map transition. Calm, plain-language copy per the app's soft-tone rules. */
export function ChapterCelebration({ chapterTitle }: ChapterCelebrationProps) {
  return (
    <motion.div
      className="overlay-scrim"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="celebrate-card"
        initial={{ scale: 0.85, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 20 }}
      >
        <motion.div
          className="celebrate-badge"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 14, delay: 0.05 }}
        >
          <Check size={30} strokeWidth={3} />
        </motion.div>
        <p className="celebrate-text">
          Nice work! {chapterTitle} complete.
        </p>
      </motion.div>
    </motion.div>
  );
}
