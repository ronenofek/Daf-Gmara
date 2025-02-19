import { getCurrentDafYomi } from "@/app/utils/date-utils"

export async function GET() {
  const dafInfo = await getCurrentDafYomi()
  return Response.json(dafInfo)
}

