# Genten: The Ultimate Cheat Sheet & Control Panel

Welcome to your master control panel for Genten. Save this file! It contains all the keyboard shortcuts, AI commands, and hidden features that make Genten a powerhouse for both Desktop and Mobile.

---

## Global Keyboard Shortcuts (Desktop)

*Note: If you are on Mac, use Cmd instead of Ctrl.*

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| `Ctrl + T` | **Toggle TARS** | Instantly opens or closes the right-hand TARS AI panel. |
| `Ctrl + K` | **Quick Open** | Opens the global search bar to jump between notes quickly. |
| `Ctrl + G` | **Graph View** | Switches the main view to the interactive Knowledge Graph. |
| `Ctrl + ,` | **Settings** | Opens the application settings and configuration menu. |
| `Ctrl + Shift + F` | **Focus Mode** | Hides all sidebars and UI elements for distraction-free writing. |
| `Ctrl + Shift + D` | **Demo Mode** | Toggles Demo/Presentation mode (hides sensitive paths/data). |
| `Ctrl + N` | **New Note** | *(Reserved)* Will instantly create a new note in the current folder. |
| `Ctrl + D` | **Daily Note** | *(Reserved)* Will instantly open today's Daily Journal. |
| `Escape` | **Close** | Closes the topmost modal, search bar, or floating window. |

---

## TARS AI Commands (The Magic)

TARS is deeply integrated into your editor. Here is how to use him:

### 1. The Inline Assistant
Anywhere inside your note, type `@tars` followed by a prompt and hit Enter.
*   **Example:** `@tars write a Python script to sort an array`
*   **What Happens:** The prompt stays intact, a blinking terminal cursor appears, and TARS streams his answer directly into your document.

### 2. The Global Assistant (Side Panel)
Hit `Ctrl + T` to open the TARS side panel. This is for persistent chats.
*   It remembers the conversation context.
*   You can ask it questions without dirtying your current Markdown document.

---

## Markdown & Editor Secrets

### The Formatting Toolbar & Inline Markdown
Genten supports standard inline Markdown syntax, meaning you can type formatting commands directly:
*   `**bold text**` for bold
*   `*italic text*` for italics
*   `# Heading 1` (or `##`, `###`) for headers
*   `> quote` for blockquotes
*   `- item` or `1. item` for lists

If you prefer using buttons instead of typing syntax, click the **Magic Wand / Pen** icon right next to your note's title. This will toggle open the **Formatting Toolbar**:
*   **Inline Styling:** Highlight any text and click the buttons to instantly wrap your text in the correct Markdown tags.
*   **Block Styling:** Click a block button to automatically insert the formatting prefix at the start of your current line.

### Internal Linking (Wikilinks)
Want to link one note to another? 
*   Type `[[` followed by the exact name of the note (e.g. `[[System Architecture]]`).
*   **Action:** It creates a clickable purple link. Clicking it will instantly open that note!

### Image Drag & Drop (Desktop)
*   **Drag & Drop:** Just drag an image from your computer and drop it into the editor.
*   **Paste:** Copy an image to your clipboard and hit `Ctrl + V`.
*   **Action:** Genten will automatically save the image securely into your Vault's `Attachments/images` folder and instantly insert the correct Markdown image tag.

### Image Upload (Mobile)
*   Tap the **Image** button next to the "Files" button at the top of your screen.
*   Select an image from your camera roll.
*   **Action:** The image is securely copied to your Android vault and inserted into the note.

---

## Syncing (PC to Mobile)

1. **Start the Server:** Go to Settings -> Sync Panel on your Desktop app and click Start Hosting.
2. **Connect Mobile:** Ensure your phone is on the same WiFi network. Open the Mobile app, skip the setup wizard, go to Settings -> Sync, enter your PC's IP address (e.g., `http://192.168.x.x:1425`), and click Sync Now.
3. **Magic:** All your files, folders, and images will flawlessly transfer to your phone!
