import { createContext, useContext } from 'react';

// Provides the current text-scale multiplier (e.g. 1.0, 1.2, 0.85) to any
// component in the tree without prop-drilling. The value is derived from
// gameState.textScale (integer 80-140) and exposed as a float (0.8 - 1.4).
// Components apply it as  style={{ zoom }}  on their root content element.

export const TextScaleContext = createContext(1.0);
export const useTextScale = () => useContext(TextScaleContext);
