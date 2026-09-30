<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use App\Services\StockService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Exception;

class ProcurementController extends Controller
{
    protected StockService $stockService;

    public function __construct(StockService $stockService)
    {
        $this->stockService = $stockService;
    }

    /**
     * Dapatkan daftar Distributor Resmi (PBF)
     */
    public function suppliers(): JsonResponse
    {
        $suppliers = [
            [
                'id' => 1,
                'code' => 'PBF-KF',
                'name' => 'PT Kimia Farma Trading & Distribution',
                'cbf' => 'CBF-9921/KEMENKES/2022',
                'city' => 'Bandung, Jawa Barat',
                'lead_time' => '1 - 2 Hari',
                'phone' => '(022) 720-1122',
                'payment_term' => 'Tempo 30 Hari',
            ],
            [
                'id' => 2,
                'code' => 'PBF-ENS',
                'name' => 'PT Enseval Putera Megatrading Tbk',
                'cbf' => 'CBF-4412/KEMENKES/2021',
                'city' => 'Bandung, Jawa Barat',
                'lead_time' => '1 Hari',
                'phone' => '(022) 540-3344',
                'payment_term' => 'Tempo 21 Hari',
            ],
            [
                'id' => 3,
                'code' => 'PBF-AAM',
                'name' => 'PT Anugrah Argon Medica (AAM)',
                'cbf' => 'CBF-7719/KEMENKES/2023',
                'city' => 'Jakarta / Bandung',
                'lead_time' => '2 - 3 Hari',
                'phone' => '(021) 650-9988',
                'payment_term' => 'Tempo 30 Hari',
            ],
            [
                'id' => 4,
                'code' => 'PBF-MBS',
                'name' => 'PT Mensa Binasukses',
                'cbf' => 'CBF-1102/KEMENKES/2022',
                'city' => 'Bandung, Jawa Barat',
                'lead_time' => '1 - 2 Hari',
                'phone' => '(022) 877-6655',
                'payment_term' => 'Tempo 14 Hari',
            ],
        ];

        return response()->json([
            'status' => 'success',
            'data' => $suppliers
        ]);
    }

    /**
     * Buat Surat Pesanan (SP) Pengadaan Obat ke PBF
     */
    public function createOrder(Request $request): JsonResponse
    {
        $request->validate([
            'supplier_name' => 'required|string|max:150',
            'sp_type' => 'required|in:Reguler,Prekursor,OOT,Narkotika,Psikotropika',
            'items' => 'required|array|min:1',
            'items.*.medicine_id' => 'required|exists:medicines,id',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.cost_price' => 'required|numeric|min:0',
        ]);

        $orderCode = 'SP-' . date('Ymd') . '-' . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT);
        $totalCost = 0;

        foreach ($request->input('items') as $it) {
            $totalCost += ($it['qty'] * $it['cost_price']);
        }

        $order = [
            'id' => time(),
            'order_code' => $orderCode,
            'sp_type' => $request->input('sp_type'),
            'supplier_name' => $request->input('supplier_name'),
            'apoteker_name' => 'Apt. Sarah Maulida, S.Farm',
            'sipa_number' => '19950812/SIPA_32.73/2022/2045',
            'status' => 'Pending',
            'total_cost' => $totalCost,
            'items' => $request->input('items'),
            'created_at' => date('Y-m-d H:i:s'),
        ];

        return response()->json([
            'status' => 'success',
            'message' => 'Surat Pesanan (SP) resmi berhasil diterbitkan.',
            'data' => $order
        ], 201);
    }

    /**
     * Penerimaan Barang & Faktur PBF (Otomatis Tambah Stok & Batch FEFO)
     */
    public function receiveOrder(Request $request): JsonResponse
    {
        $request->validate([
            'order_code' => 'required|string',
            'invoice_no' => 'required|string|max:100',
            'received_items' => 'required|array|min:1',
            'received_items.*.medicine_id' => 'required|exists:medicines,id',
            'received_items.*.qty_received' => 'required|integer|min:1',
            'received_items.*.batch_no' => 'required|string',
            'received_items.*.expiry_date' => 'required|date|after:today',
        ]);

        try {
            DB::transaction(function () use ($request) {
                foreach ($request->input('received_items') as $item) {
                    $this->stockService->increaseStock(
                        $item['medicine_id'],
                        $item['qty_received'],
                        'Penerimaan Faktur PBF ' . $request->input('invoice_no') . ' (Batch ' . $item['batch_no'] . ')',
                        $request->input('order_code'),
                        auth()->id()
                    );
                }
            });

            return response()->json([
                'status' => 'success',
                'message' => 'Barang masuk dari PBF berhasil diverifikasi. Stok dan Batch FEFO telah diperbarui.',
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menerima barang: ' . $e->getMessage()
            ], 422);
        }
    }
}
