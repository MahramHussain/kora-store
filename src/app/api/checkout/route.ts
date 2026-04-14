import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Check the bouncer: Who is trying to checkout?
    const { userId } = await auth();
    const clerkUser = await currentUser(); // <--- Added this to get your email/name!

    if (!userId || !clerkUser) {
      return new NextResponse("Unauthorized. Please log in.", { status: 401 });
    }

    // 2. Grab the cart items and the total price they sent us
    const body = await req.json();
    const { items, cartTotal } = body;

    if (!items || items.length === 0) {
      return new NextResponse("Cart is empty", { status: 400 });
    }

    // 🔥 THE FIX: THE AUTO-SYNC BOUNCER 🔥
    // This forces your local database to register the Clerk user before they buy!
    await prisma.user.upsert({
      where: { id: userId },
      update: {}, // If they already exist, do nothing
      create: {
        id: userId,
        email: clerkUser.emailAddresses[0].emailAddress,
        firstName: clerkUser.firstName || "Kora",
        lastName: clerkUser.lastName || "Shopper",
      }
    });

    // 3. Write the Order to the Database!
    // We use Prisma's nested create to make the Order AND the OrderItems at the exact same time
    const order = await prisma.order.create({
      data: {
        userId: userId,
        total: cartTotal,
        status: "Processing",
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            size: item.size,
            quantity: item.quantity,
            // We strip the "$" out if it's there so the database stores pure numbers
            price: parseFloat(item.price.replace('$', '')), 
          })),
        },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("[CHECKOUT_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}