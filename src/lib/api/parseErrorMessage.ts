export async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const body: unknown = await res.json();
    if (body && typeof body === "object" && "message" in body) {
      const msg = (body as { message: unknown }).message;
      if (Array.isArray(msg)) return msg.map(String).join(", ");
      if (typeof msg === "string") return msg;
    }
  } catch {
    /* ignore */
  }
  return res.statusText || "Request failed";
}
