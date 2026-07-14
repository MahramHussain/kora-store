import { NextResponse } from "next/server";
import { getPromoDiscount } from "@/lib/promo";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const code = body.code;

    if (!code) {
      return NextResponse.json({
        valid: false,
        discountPercent: 0,
        messageKey: "invalid_promo"
      });
    }

    const discountPercent = getPromoDiscount(code);

    if (discountPercent > 0) {
      let messageKey = "invalid_promo";
      if (discountPercent === 0.10) {
        messageKey = "promo_10_applied";
      } else if (discountPercent === 0.20) {
        messageKey = "promo_20_applied";
      }

      return NextResponse.json({
        valid: true,
        discountPercent,
        messageKey
      });
    }

    return NextResponse.json({
      valid: false,
      discountPercent: 0,
      messageKey: "invalid_promo"
    });
  } catch (error) {
    return NextResponse.json({
      valid: false,
      discountPercent: 0,
      messageKey: "invalid_promo"
    }, { status: 400 });
  }
}
