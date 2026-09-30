<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\Medicine;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportService
{
    /**
     * Mengambil ringkasan laporan penjualan berdasarkan rentang tanggal
     * 
     * @param string|null $startDate
     * @param string|null $endDate
     * @param int|null $categoryId
     * @return array
     */
    public function getSalesReportSummary(?string $startDate = null, ?string $endDate = null, ?int $categoryId = null): array
    {
        $start = $startDate ? Carbon::parse($startDate)->startOfDay() : Carbon::now()->startOfMonth();
        $end = $endDate ? Carbon::parse($endDate)->endOfDay() : Carbon::now()->endOfDay();

        $query = Transaction::with(['details.medicine.category', 'user'])
            ->where('payment_status', 'Paid')
            ->whereBetween('created_at', [$start, $end]);

        if ($categoryId) {
            $query->whereHas('details.medicine', function ($q) use ($categoryId) {
                $q->where('category_id', $categoryId);
            });
        }

        $transactions = $query->orderBy('created_at', 'desc')->get();

        $totalRevenue = $transactions->sum('total_amount');
        $totalTransactions = $transactions->count();
        $totalItemsSold = $transactions->sum(function ($tx) {
            return $tx->details->sum('qty');
        });

        // Top selling medicines
        $topMedicines = TransactionDetail::select('medicine_id', DB::raw('SUM(qty) as total_qty'), DB::raw('SUM(subtotal) as total_sales'))
            ->whereHas('transaction', function ($q) use ($start, $end) {
                $q->where('payment_status', 'Paid')
                  ->whereBetween('created_at', [$start, $end]);
            })
            ->groupBy('medicine_id')
            ->with('medicine.category')
            ->orderByDesc('total_qty')
            ->limit(5)
            ->get();

        return [
            'period' => [
                'start' => $start->toDateString(),
                'end'   => $end->toDateString(),
            ],
            'metrics' => [
                'total_revenue'      => $totalRevenue,
                'total_transactions' => $totalTransactions,
                'total_items_sold'   => $totalItemsSold,
                'average_basket_size'=> $totalTransactions > 0 ? round($totalRevenue / $totalTransactions, 2) : 0,
            ],
            'transactions' => $transactions,
            'top_medicines' => $topMedicines,
        ];
    }

    /**
     * Mengambil ringkasan status inventaris & peringatan stok/kedaluwarsa
     * 
     * @return array
     */
    public function getInventoryHealthReport(): array
    {
        $totalMedicines = Medicine::count();
        $totalStockValue = Medicine::sum(DB::raw('stock * price'));
        
        $lowStockMedicines = Medicine::with('category')
            ->whereColumn('stock', '<=', 'min_stock')
            ->orderBy('stock', 'asc')
            ->get();

        $today = Carbon::today();
        $threeMonthsFromNow = Carbon::today()->addMonths(3);

        $expiredMedicines = Medicine::with('category')
            ->where('expiry_date', '<', $today)
            ->get();

        $nearExpiryMedicines = Medicine::with('category')
            ->whereBetween('expiry_date', [$today, $threeMonthsFromNow])
            ->orderBy('expiry_date', 'asc')
            ->get();

        return [
            'total_medicines'     => $totalMedicines,
            'total_stock_value'   => $totalStockValue,
            'low_stock_count'     => $lowStockMedicines->count(),
            'low_stock_items'     => $lowStockMedicines,
            'expired_count'       => $expiredMedicines->count(),
            'expired_items'       => $expiredMedicines,
            'near_expiry_count'   => $nearExpiryMedicines->count(),
            'near_expiry_items'   => $nearExpiryMedicines,
        ];
    }
}
