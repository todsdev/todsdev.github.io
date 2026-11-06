/**
 * Browser storage keys shared by several scripts. Side-effect free, so the lazily loaded
 * terminal shell can import it without pulling in the scripts that use it.
 */

/** Language chosen with the switcher or the terminal's `lang`; read by the root redirect. */
export const PREFERRED_LOCALE_KEY = "preferred-locale";
