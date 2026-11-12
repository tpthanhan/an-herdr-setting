import { View, div } from "gpui-kit";
import { appHome, exec, focused, nextCommand, notify, run } from "herdr";

export default class PiImagePaste extends View {
  init(_props, cx) {
    cx.spawn(async (cx) => {
      for (;;) {
        const command = await nextCommand();
        if (command !== "paste") continue;
        const terminal = focused()?.terminal;
        if (!terminal) continue;
        // Stay on Herdr's native path for text (including empty text). Starting
        // PowerShell just to discover there is no image adds latency to every paste.
        if (terminal.includes("/") || typeof cx.read_from_clipboard() === "string") {
          run("terminal.paste");
          continue;
        }
        let path = null;
        try {
          const result = await this.clipboard("Save");
          if (result.code !== 0) throw new Error(result.stderr || "Clipboard image save failed");
          path = result.stdout.trim();
          if (focused()?.terminal !== terminal) {
            throw new Error("Terminal focus changed; paste cancelled. Try again in the intended terminal.");
          }
          run(path ? "terminal.paste_image" : "terminal.paste");
        } catch (error) {
          notify({ title: "Image paste failed", body: String(error), level: "error" });
        } finally {
          if (path) {
            try {
              const restored = await this.clipboard("Restore", path);
              if (restored.code !== 0) throw new Error(restored.stderr || "Clipboard restore failed");
            } catch (error) {
              notify({ title: "Clipboard restore failed", body: String(error), level: "error" });
            }
          }
        }
      }
    });
  }

  clipboard(action, path) {
    const args = ["-NoProfile", "-NonInteractive", "-STA", "-File",
      `${appHome()}/mods/pi-image-paste/clipboard.ps1`, "-Action", action];
    if (path) args.push("-ImagePath", path);
    return exec("powershell.exe", args);
  }

  render() {
    return div().h(0);
  }
}
