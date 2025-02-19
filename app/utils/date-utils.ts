
import axios from "axios";
import * as cheerio from "cheerio";
import { printHDate } from "hdate";

/**
 * Converts a Hebrew numeral string (e.g. "ס"ד") to a number.
 * Note: This is a basic conversion for common daf values.
 */
function hebrewNumeralToNumber(hebrewNum: string): number {
  // Map Hebrew letters to their numeric values.
  const values: { [key: string]: number } = {
    'א': 1,  'ב': 2,  'ג': 3,  'ד': 4,  'ה': 5,  'ו': 6,  'ז': 7,  'ח': 8,  'ט': 9,
    'י': 10, 'כ': 20, 'ל': 30, 'מ': 40, 'נ': 50, 'ס': 60, 'ע': 70, 'פ': 80, 'צ': 90,
    'ק': 100, 'ר': 200, 'ש': 300, 'ת': 400
  };
  let total = 0;
  for (const char of hebrewNum) {
    const value = values[char];
    if (value) {
      total += value;
    }
  }
  return total;
}

/**
 * Fetches the current Daf Yomi from https://daf-yomi.com/dafYomi.aspx,
 * extracts the masechet and daf, and returns the current Gregorian and Hebrew dates.
 */
export async function getCurrentDafYomi(): Promise<{
  masechet: string;
  daf: number;
  date: string;
  hebrewDate: string;
}> {
  try {
    const url = "https://daf-yomi.com/dafYomi.aspx";
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    // Attempt to find the element containing the Daf Yomi info.
    // This example first tries an element with id "DafInfo".
    let dafText = $("#DafInfo").text().trim();

    // Fallback: search common tags for text that includes a space (e.g., "סנהדרין ס"ד")
    if (!dafText) {
      $("span, div").each((_, element) => {
        const text = $(element).text().trim();
        if (text && text.includes(" ")) {
          dafText = text;
          return false; // break out of the loop
        }
      });
    }

    if (!dafText) {
      throw new Error("Could not extract Daf Yomi text from the page.");
    }

    // Assume the text format is: "<masechet> <daf in Hebrew numeral>"
    // For example: "סנהדרין ס״ד"
    const parts = dafText.split(" ");
    if (parts.length < 2) {
      throw new Error(`Unexpected Daf Yomi format: ${dafText}`);
    }

    const masechet = parts[0];
    // Remove common punctuation (like quotes or gershayim) from the daf part
    const dafHebrew = parts[1].replace(/["'״]/g, "");
    const dafNumber = hebrewNumeralToNumber(dafHebrew);

    // Get current Gregorian and Hebrew dates
    const today = new Date();
    const gregorianDate = today.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const hebrewDate = printHDate(today);

    return {
      masechet,
      daf: dafNumber,
      date: gregorianDate,
      hebrewDate,
    };
  } catch (error) {
    console.error("Error in getCurrentDafYomi:", error);
    throw error;
  }
}

// Example usage (for testing purposes):
// (async () => {
//   const currentDaf = await getCurrentDafYomi();
//   console.log(currentDaf);
// })();


/*export async function getCurrentDafYomi(): Promise<{
  masechet: string
  daf: number
  date: string
  hebrewDate: string
}> {
  // In a real app, this would fetch from a Daf Yomi API
  // For demo, returning static data 
  // need to be fixed
  const today = new Date()
  return {
    masechet: "Ketubot",
    daf: 23,
    date: today.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    hebrewDate: "י״ט שבט תשפ״ה",
  }
}

*/