/**
 * JupyterLab applications based on jupyterLab components
 */
import { ServerConnection, TerminalManager } from "@jupyterlab/services";
import { Terminal } from "@jupyterlab/terminal";
import { Panel, Widget } from "@phosphor/widgets";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class JupyterLabAppFactory {
  public static async createTerminalApp(serverSettings: ServerConnection.ISettings) {
    const manager = new TerminalManager({
      serverSettings: serverSettings,
    });
    const session = await manager.startNew();
    const term = new Terminal(session, { theme: "dark", shutdownOnClose: true });

    if (!term) {
      console.error("Failed starting terminal");
      return;
    }

    term.title.closable = false;
    term.addClass("terminalWidget");

    const panel = new Panel();
    panel.addWidget((term as unknown) as Widget);
    panel.id = "main";

    // Attach the widget to the dom.
    Widget.attach(panel, document.body);

    // Handle resize events.
    window.addEventListener("resize", () => {
      panel.update();
    });

    // Dispose terminal when unloading.
    window.addEventListener("unload", () => {
      panel.dispose();
    });
  }
}
