/**
 * Automatically translates English text to Arabic using the MyMemory Translation API.
 * Includes a fallback to return the original English text in case of any network or API failures.
 */
export async function translateToArabic(text: string): Promise<string> {
  if (!text || typeof text !== "string") return "";
  const trimmed = text.trim();
  if (trimmed === "") return "";

  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=en|ar`,
      {
        method: "GET",
        headers: { "Accept": "application/json" },
        // Set a short timeout (e.g. 5 seconds) to keep the app snappy and prevent hanging
        signal: AbortSignal.timeout(5000),
      }
    );

    if (response.ok) {
      const data = await response.json();
      const translatedText = data?.responseData?.translatedText;
      if (translatedText) {
        // Strip out HTML entities if any are returned, and return the cleaned text
        return decodeHtmlEntities(translatedText);
      }
    }
  } catch (error) {
    console.error("Translation API failure, falling back to original text:", error);
  }

  // Fallback to the original English text so adding products never breaks or hangs
  return text;
}

/**
 * Basic helper to decode common HTML entities returned by translation APIs
 */
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}
