export async function askAgent(messages, invoices) {
  try {
    const lastMessage = messages[messages.length - 1]?.content || "";
    const response = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: lastMessage, invoices })
    });
    const data = await response.json();
    return { text: data.reply || "No response", action: null };
  } catch (err) {
    return { text: "Connection error.", action: null };
  }
}
