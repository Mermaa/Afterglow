# Afterglow · Memory / Light

**[Experience Afterglow online →](https://mermaa.github.io/Afterglow/)**

An interactive web artwork about memory, forgetting, and companionship, inspired by the subject of dementia.

Explore darkness with a cursor-controlled light. Approach floating old papers to bring memories forward; words, ages, and recollections may change on return. Brief moments of clarity restore warmth and completeness. A simulated companion light can help stabilize a memory. The ending reverses the search: a final memory comes to meet the visitor.

This is an artistic metaphor, not a clinical simulation. The original memory fragments are fictional.

## Run locally

Requires Python 3. No package installation or build step is needed.

```sh
python3 -m http.server 8081 --bind 127.0.0.1
```

Run that command in the project directory and open **http://127.0.0.1:8081/**. Keep the terminal running. Press Control+C to stop.

On macOS, `Start Afterglow.command` launches the same server when opened from Finder.

## Controls

- Move the mouse, touch, or use arrow keys to guide the light.
- Stay on a paper for about half a second to select it.
- Use **Controls** or Tab to reach Help, Sound, Companion light, and Leave a memory.
- Sound is off by default and starts only after the visitor enables it.
- Space pauses drifting; Escape closes dialogs.
- Optional mobile orientation input requires browser permission and may require a secure HTTPS origin. Touch lighting remains available without it.
- Reduced-motion preferences disable parallax and drifting.

## Files

- `index.html`: page, controls, and dialogs.
- `style.css`: typography, paper scene, atmosphere, and accessible states.
- `script.js`: memory interaction, CSS 3D positioning, lighting, state transitions, procedural audio, local storage, and ending.
- `assets/paper-transparent.png`: current transparent paper texture.
- `assets/paper-source.png`: original texture reference retained with the project.
- `paper-reference.html`: standalone lighting study.
- `Start Afterglow.command`: macOS preview launcher.

## Current scope

Built with native HTML, CSS, and JavaScript, CSS 3D transforms, and the Web Audio API. No framework, WebGL, build tool, or external audio files are required.

The companion light is simulated locally; there is no real-time multiplayer backend. Visitor memories stay in the current browser's localStorage and are not shared between devices or visitors. Clearing browser storage removes them.

The ending begins after six distinct memories have fully revealed, or after four minutes of exploration, once the current reveal and any dialog have finished. The final age-83 memory is reserved for that ending.

A local server is recommended over opening index.html directly. The live website is deployed through GitHub Pages from the `main` branch.

## Development status

The project has been iterated using screenshots, listening feedback, syntax checks, and scripted interaction simulations. Full cross-browser, real-device sensor, screen-reader, and audio testing remains ongoing.
