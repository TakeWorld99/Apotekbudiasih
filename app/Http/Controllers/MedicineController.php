<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use App\Models\Category;
use App\Services\StockService;
use App\Http\Requests\StoreMedicineRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MedicineController extends Controller
{
    protected StockService $stockService;

    public function __construct(StockService $stockService)
    {
        $this->stockService = $stockService;
    }

    public function index(Request $request): JsonResponse
    {
        $query = Medicine::with('category');

        // Filter search keyword (Name, SKU, BPOM)
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku_code', 'like', "%{$search}%")
                  ->orWhere('bpom_number', 'like', "%{$search}%");
            });
        }

        // Filter category
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        // Filter type (Bebas / Keras / etc)
        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        // Filter low stock status
        if ($request->boolean('low_stock')) {
            $query->whereColumn('stock', '<=', 'min_stock');
        }

        // Filter expired / near expiry
        if ($request->boolean('near_expiry')) {
            $query->whereBetween('expiry_date', [now(), now()->addDays(90)]);
        }

        $medicines = $query->orderBy('name', 'asc')->paginate($request->input('per_page', 20));

        return response()->json($medicines);
    }

    public function store(StoreMedicineRequest $request): JsonResponse
    {
        $validated = $request->validated();
        if (empty($validated['sku_code'])) {
            $validated['sku_code'] = 'MED-' . strtoupper(bin2hex(random_bytes(3)));
        }
        $medicine = Medicine::create($validated);

        // Jika ada stok awal, catat ke stock logs
        if ($medicine->stock > 0) {
            $this->stockService->increaseStock(
                $medicine->id,
                $medicine->stock,
                'Stok Awal Pendaftaran Obat',
                'INIT-' . $medicine->sku_code,
                auth()->id()
            );
        }

        return response()->json([
            'message' => 'Obat berhasil ditambahkan',
            'data'    => $medicine->load('category'),
        ], 201);
    }

    public function show(Medicine $medicine): JsonResponse
    {
        return response()->json(
            $medicine->load(['category', 'stockLogs' => function ($q) {
                $q->orderBy('created_at', 'desc')->limit(15);
            }])
        );
    }

    public function update(StoreMedicineRequest $request, Medicine $medicine): JsonResponse
    {
        $medicine->update($request->validated());

        return response()->json([
            'message' => 'Data obat berhasil diperbarui',
            'data'    => $medicine->load('category'),
        ]);
    }

    public function destroy(Medicine $medicine): JsonResponse
    {
        $medicine->delete();
        return response()->json(['message' => 'Obat berhasil dihapus']);
    }

    public function adjustStock(Request $request, Medicine $medicine): JsonResponse
    {
        $request->validate([
            'type'   => 'required|in:In,Out,Adjust',
            'qty'    => 'required|integer',
            'reason' => 'required|string|max:255',
        ]);

        $type = $request->input('type');
        $qty = $request->input('qty');
        $reason = $request->input('reason');
        $userId = auth()->id();

        if ($type === 'In') {
            $this->stockService->increaseStock($medicine->id, $qty, $reason, 'MANUAL-IN', $userId);
        } elseif ($type === 'Out') {
            $this->stockService->decreaseStock($medicine->id, $qty, $reason, 'MANUAL-OUT', $userId);
        } else {
            $this->stockService->adjustStock($medicine->id, $qty, $reason, $userId);
        }

        return response()->json([
            'message' => 'Stok berhasil diperbarui',
            'medicine' => $medicine->fresh(['category', 'stockLogs']),
        ]);
    }
}
