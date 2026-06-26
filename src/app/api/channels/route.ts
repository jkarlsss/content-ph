import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    
    const channels = await prisma.userChannels.findMany();

    if (!channels) {
      return NextResponse.json({}, { status: 404 });
    }
 
    return NextResponse.json({ channels }, { status: 200 });
   } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}