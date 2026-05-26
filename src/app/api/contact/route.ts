import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, location, message, captcha } = body;

    // Validasi input wajib
    if (!name || !email || !location || !message) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
        { status: 400 }
      );
    }

    // Verifikasi Math Captcha (5 + 3 = 8)
    if (parseInt(captcha) !== 8) {
      return NextResponse.json(
        { error: 'Captcha tidak valid' },
        { status: 400 }
      );
    }

    // Simulasi pemrosesan (misalnya menyimpan ke DB atau meneruskan ke email API)
    console.log('--- KONTAN BARU DITERIMA ---');
    console.log(`Nama: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Lokasi Isu: ${location}`);
    console.log(`Pesan/Solusi: ${message}`);
    console.log('-----------------------------');

    return NextResponse.json(
      { 
        success: true,
        message: 'Aduan spasial berhasil direkam sistem telemetri.'
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem internal' },
      { status: 500 }
    );
  }
}
