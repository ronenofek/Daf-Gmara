import { getCurrentDafYomi } from "@/app/utils/date-utils"

export async function GET() {
  try {
    const dafInfo = await getCurrentDafYomi()
    return Response.json(dafInfo)
  } catch (error) {
    console.error("Error in daf-info API:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack available")
    return Response.json(
      {
        error: "Failed to fetch Daf Yomi information",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : "No stack available",
      },
      { status: 500 },
    )
  }
}

