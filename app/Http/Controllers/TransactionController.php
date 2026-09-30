<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\Prescription;
use App\Services\StockService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Exception;

class TransactionController extends Controller
{
    protected StockService $stockService;

    public function __construct(StockService $stockService)
    {
        $this->stockService = $stockService;
    }

    public function index(Request $request): JsonResponse
    {
        $query = Transaction::with(['user', 'details.medicine', 'prescription']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('invoice_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%");
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->input('payment_status'));
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('created_at', [
                $request->input('start_date') . ' 00:00:00',
                $request->input('end_date') . ' 23:59:59',
            ]);
        }

        $transactions = $query->orderBy('created_at', 'desc')->paginate($request->input('per_page', 20));

        return response()->json($transactions);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'customer_name'   => 'nullable|string|max:100',
            'prescription_id' => 'nullable|exists:prescriptions,id',
            'items'           => 'required|array|min:1',
            'items.*.id'      => 'required|exists:medicines,id',
            'items.*.qty'     => 'required|integer|min:1',
            'items.*.price'   => 'required|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'tax_amount'      => 'nullable|numeric|min:0',
            'paid_amount'     => 'required|numeric|min:0',
            'payment_method'  => 'required|in:Cash,QRIS,Debit,Transfer',
            'notes'           => 'nullable|string|max:255',
        ]);

        try {
            $transaction = DB::transaction(function () use ($request) {
                // 1. Generate Nomor Faktur Unik
                $dateCode = date('Ymd');
                $dailyCount = Transaction::whereDate('created_at', today())->count() + 1;
                $invoiceNumber = 'INV-' . $dateCode . '-' . str_pad($dailyCount, 4, '0', STR_PAD_LEFT);

                $items = $request->input('items');
                $subtotal = 0;
                foreach ($items as $item) {
                    $subtotal += ($item['price'] * $item['qty']);
                }

                $discount = $request->input('discount_amount', 0);
                $tax = $request->input('tax_amount', 0);
                $totalAmount = max(0, $subtotal - $discount + $tax);
                $paidAmount = $request->input('paid_amount', $totalAmount);
                $changeAmount = max(0, $paidAmount - $totalAmount);

                // 2. Buat Record Header Transaksi
                $transaction = Transaction::create([
                    'invoice_number'  => $invoiceNumber,
                    'user_id'         => auth()->id() ?? 1,
                    'customer_name'   => $request->input('customer_name') ?: 'Pelanggan Umum',
                    'prescription_id' => $request->input('prescription_id'),
                    'subtotal'        => $subtotal,
                    'discount_amount' => $discount,
                    'tax_amount'      => $tax,
                    'total_amount'    => $totalAmount,
                    'paid_amount'     => $paidAmount,
                    'change_amount'   => $changeAmount,
                    'payment_status'  => 'Paid',
                    'payment_method'  => $request->input('payment_method'),
                    'notes'           => $request->input('notes'),
                ]);

                // 3. Simpan Detail Transaksi dan Kurangi Stok Obat Otomatis
                foreach ($items as $item) {
                    $itemSubtotal = $item['price'] * $item['qty'];

                    TransactionDetail::create([
                        'transaction_id' => $transaction->id,
                        'medicine_id'    => $item['id'],
                        'qty'            => $item['qty'],
                        'price'          => $item['price'],
                        'subtotal'       => $itemSubtotal,
                    ]);

                    // Kurangi stok via StockService (dengan atomisitas dan stock_logs)
                    $this->stockService->decreaseStock(
                        medicineId: $item['id'],
                        qty: $item['qty'],
                        reason: "Penjualan POS Invoice {$invoiceNumber}",
                        referenceId: $invoiceNumber,
                        userId: auth()->id()
                    );
                }

                // 4. Update status resep jika transaksi berasal dari resep dokter
                if ($request->filled('prescription_id')) {
                    Prescription::where('id', $request->input('prescription_id'))
                        ->update(['status' => 'Processed']);
                }

                return $transaction;
            });

            return response()->json([
                'message'     => 'Transaksi berhasil disimpan',
                'transaction' => $transaction->load(['details.medicine', 'user', 'prescription']),
            ], 201);

        } catch (Exception $e) {
            return response()->json([
                'message' => 'Gagal memproses transaksi: ' . $e->getMessage(),
            ], 422);
        }
    }

    public function show(Transaction $transaction): JsonResponse
    {
        return response()->json(
            $transaction->load(['user', 'details.medicine.category', 'prescription'])
        );
    }
}
