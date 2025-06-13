# **App Name**: Shuddho AI Assistant

## Core Features:

- Text Detection: Detect Bangla text in textarea or contenteditable fields upon selection.
- Context Button: Enable 'Fix with ShuddhoBangla' button on text selection.
- AI Proofreading: Correct spelling and grammar using the OpenAI GPT API with a tool that will optionally provide a plain-language explanation.
- Results Display: Display corrected text, explanation, and quality score (out of 100) in the extension's popup UI.
- Tone Selection: Allow users to choose the tone (Formal, Friendly, Poetic) via a dropdown menu.
- Copy to Clipboard: Copy corrected text from the output area to the clipboard with a single click.
- Context Menu: Provide a right-click context menu option: 'Fix Bangla with ShuddhoBangla AI'.

## Style Guidelines:

- Primary color: Soft lavender (#D0B4DE) for a modern and calming feel. This hue is suggestive of knowledge but without being cliché.
- Background color: Very light gray (#F5F3F6), almost white, for a clean and readable interface.
- Accent color: Pale blue (#B4D0DE) for interactive elements and highlights, contrasting with the lavender and hinting at tradition without being overt.
- Font pairing: 'Belleza' (sans-serif) for headlines, paired with 'Alegreya' (serif) for body text, to blend personality with readability.
- Code Font: 'Source Code Pro' (monospace) for displaying API calls and code snippets in the documentation.
- Simple, line-style icons for different tones (Formal, Friendly, Poetic), each distinct and easily recognizable.
- Clean and intuitive layout with clear separation between input and output areas in the popup UI, utilizing TailwindCSS for responsiveness.