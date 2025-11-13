import net from "net";

/**
 * Repeatedly checks if a local port is open, retrying until ready or timeout.
 *
 * @param port - The TCP port to check (e.g. 8082)
 * @param retries - Number of retries (default 25 = ~50 seconds total)
 * @param intervalMs - Delay between retries (default 2000ms)
 * @returns true if port became reachable, false otherwise
 */
export async function checkPort(port: number, retries = 25, intervalMs = 2000): Promise<boolean> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        const isOpen = await new Promise<boolean>((resolve) => {
            const socket = new net.Socket();
            socket.setTimeout(1500);

            socket
                .once("connect", () => {
                    socket.destroy();
                    resolve(true);
                })
                .once("timeout", () => {
                    socket.destroy();
                    resolve(false);
                })
                .once("error", () => {
                    resolve(false);
                });

            socket.connect(port, "127.0.0.1");
        });

        if (isOpen) {
            console.log(`✅ Port ${port} responsive after ${attempt} check(s).`);
            return true;
        }

        console.log(`⏳ Waiting for port ${port}... (${attempt}/${retries})`);
        await new Promise((r) => setTimeout(r, intervalMs));
    }

    console.error(`❌ Port ${port} did not open after ${retries * (intervalMs / 1000)} seconds.`);
    return false;
}
