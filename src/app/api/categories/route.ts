import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { songs: true } } },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json(
      { error: "Kategoriler yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Kategori adı zorunludur" },
        { status: 400 }
      );
    }

    const slug = slugify(name.trim());

    const existing = await prisma.category.findFirst({
      where: { OR: [{ name: name.trim() }, { slug }] },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Bu kategori zaten mevcut" },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: { name: name.trim(), slug },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("POST /api/categories error:", error);
    return NextResponse.json(
      { error: "Kategori oluşturulurken hata oluştu" },
      { status: 500 }
    );
  }
}
