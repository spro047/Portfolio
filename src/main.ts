// Entrypoint — import boot sequence and desktop transition
import { runBootSequence } from './boot';
import { transitionToDesktop } from './desktop';

// Boot then transition to desktop
runBootSequence().then(transitionToDesktop);
