<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
{
    return response()->json(
        \App\Models\Invoice::with('kunjungan.pasien')->latest()->get()
    );
}

public function store(Request $request)
{
    $validated = $request->validate([
        'kunjungan_id' => 'required|exists:kunjungans,id',
        'jenis_layanan' => 'required|string',
        'total_biaya' => 'required|integer',
        'status' => 'nullable|string',
    ]);

    $invoice = \App\Models\Invoice::create([
        'kunjungan_id' => $validated['kunjungan_id'],
        'jenis_layanan' => $validated['jenis_layanan'],
        'total_biaya' => $validated['total_biaya'],
        'status' => $validated['status'] ?? 'belum_dibayar',
    ]);

    return response()->json($invoice->load('kunjungan.pasien'), 201);
}
}
