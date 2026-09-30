<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use App\Services\StockService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Exception;

class BatchController extends Controller
{
    protected StockService $stockService;

    public function __construct(StockService $stockService)
    {
        $this->stockService = $stockService;
    }

    /**
     * Dapatkan daftar Batch Obat Terurut FEFO (First-Expired, First-Out)
     */
    public function index(Request $request): JsonResponse
    {
        // Mock / Eloquent FEFO batches list
        $batches = [
            [
                'id' => 1,
                'medicine_id' => 1,
                'medicine_name' => 'Paracetamol 500mg (Dus 10 Strip)',
                'sku' => 'MED-PAR-500',
                'batch_no' => 'B2026-0881',
                'pbf_source' => 'PT Kimia Farma Trading & Distribution',
                'expiry_date' => date('Y-m-d', strtotime('+500 days')),
                'current_stock' => 120,
                'status' => 'Aman',
            ],
            [
                'id' => 2,
                'medicine_id' => 3,
                'medicine_name' => 'Amoxicillin 500mg (Dus 10 Strip)',
                'sku' => 'MED-AMX-500',
                'batch_no' => 'B2026-0312',
                'pbf_source' => 'PT Enseval Putera Megatrading Tbk',
                'expiry_date' => date('Y-m-d', strtotime('+45 days')),
                'current_stock' => 15,
                'status' => 'Kritis',
            ],
            [
                'id' => 3,
                'medicine_id' => 7,
                'medicine_name' => 'OBH Tropica Plus Anak 60ml',
                'sku' => 'MED-OBH-060',
                'batch_no' => 'B2025-0994',
                'pbf_source' => 'PT Mensa Binasukses',
                'expiry_date' => date('Y-m-d', strtotime('-10 days')),
                'current_stock' => 4,
                'status' => 'Expired',
            ],
        ];

        return response()->json([
            'status' => 'success',
            'data' => $batches
        ]);
    }

    /**
     * Pemusnahan / Retur Obat Kedaluwarsa (BA Pemusnahan BPOM)
     */
    public function dispose(Request $request): JsonResponse
    {
        $request->validate([
            'batch_id' => 'required',
            'medicine_id' => 'required|exists:medicines,id',
            'qty' => 'required|integer|min:1',
            'reason' => 'required|string|max:255',
            'ba_number' => 'nullable|string|max:100',
        ]);

        try {
            $this->stockService->decreaseStock(
                $request->input('medicine_id'),
                $request->input('qty'),
                'Pemusnahan Obat Kadaluwarsa / Retur: ' . $request->input('reason'),
                $request->input('ba_number') ?? ('BA-' . date('Ymd') . '-' . rand(100, 999)),
                auth()->id()
            );

            return response()->json([
                'status' => 'success',
                'message' => 'Batch obat berhasil dimusnahkan/diretur dan stok mutasi telah tercatat.',
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memusnahkan batch: ' . $e->getMessage()
            ], 422);
        }
    }
}
