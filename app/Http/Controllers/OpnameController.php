<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\OpnameReport;
use App\Models\Medicine;
use App\Models\StockLog;
use App\Services\StockService;
use Illuminate\Support\Facades\DB;

class OpnameController extends Controller
{
    /**
     * Menampilkan daftar riwayat Berita Acara Stock Opname (BASO)
     */
    public function index()
    {
        $reports = OpnameReport::orderBy('created_at', 'desc')->get();
        return response()->json([
            'success' => true,
            'data' => $reports
        ]);
    }

    /**
     * Persetujuan Admin / Apoteker & Rekonsiliasi Otomatis ke Master Stok
     */
    public function approve(Request $request, StockService $stockService)
    {
        $validated = $request->validate([
            'report_no'               => 'required|string',
            'items'                   => 'required|array',
            'schedule_id'             => 'nullable|integer',
            'schedule_title'          => 'nullable|string',
            'week_number'             => 'nullable|integer',
            'category_names'          => 'nullable|string',
            'performed_by'            => 'nullable|string',
            'approved_by'             => 'nullable|string',
            'total_items_counted'     => 'nullable|integer',
            'matched_items_count'     => 'nullable|integer',
            'discrepancy_items_count' => 'nullable|integer',
            'total_variance_value'    => 'nullable|numeric',
            'notes'                   => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $request, $stockService) {
            $report = OpnameReport::updateOrCreate(
                ['report_no' => $validated['report_no']],
                [
                    'schedule_id'             => $validated['schedule_id'] ?? null,
                    'schedule_title'          => $validated['schedule_title'] ?? null,
                    'week_number'             => $validated['week_number'] ?? null,
                    'category_names'          => $validated['category_names'] ?? null,
                    'performed_at'            => now()->format('Y-m-d H:i'),
                    'performed_by'            => $validated['performed_by'] ?? 'Petugas Apotek',
                    'approved_by'             => $validated['approved_by'] ?? ($request->user()?->name ?? 'Admin Apotek'),
                    'total_items_counted'     => $validated['total_items_counted'] ?? count($validated['items']),
                    'matched_items_count'     => $validated['matched_items_count'] ?? 0,
                    'discrepancy_items_count' => $validated['discrepancy_items_count'] ?? 0,
                    'total_variance_value'    => $validated['total_variance_value'] ?? 0,
                    'status'                  => 'Disetujui Admin',
                    'notes'                   => $validated['notes'] ?? null,
                    'items'                   => $validated['items'],
                ]
            );

            // Perbarui stok master obat dan catat mutasi ke stock_logs
            foreach ($validated['items'] as $item) {
                if (isset($item['medicine_id']) && isset($item['physical_stock'])) {
                    $medId = (int) $item['medicine_id'];
                    $physicalStock = (int) $item['physical_stock'];
                    $reason = $item['reason'] ?? 'Stock Opname Fisik';
                    
                    try {
                        $stockService->adjustStock(
                            $medId, 
                            $physicalStock, 
                            "Stock Opname ({$validated['report_no']}): {$reason}", 
                            $request->user()?->id
                        );
                    } catch (\Exception $e) {
                        // Fallback manual update jika data referensi batch tertentu berbeda
                        $med = Medicine::find($medId);
                        if ($med) {
                            $diff = $physicalStock - $med->stock;
                            $med->stock = $physicalStock;
                            $med->save();

                            if ($diff !== 0) {
                                StockLog::create([
                                    'medicine_id'   => $med->id,
                                    'user_id'       => $request->user()?->id,
                                    'type'          => 'Adjust',
                                    'qty'           => $diff,
                                    'current_stock' => $physicalStock,
                                    'reason'        => "Stock Opname ({$validated['report_no']}): {$reason}",
                                    'reference_id'  => $validated['report_no'],
                                    'created_at'    => now(),
                                ]);
                            }
                        }
                    }
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Berita Acara {$report->report_no} berhasil disetujui & stok master direkonsiliasi.",
                'report'  => $report,
            ]);
        });
    }

    /**
     * Hapus arsip Berita Acara (BASO) - Hanya Role Owner
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        if ($user && $user->role !== 'Owner') {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak: Hanya pengguna dengan role "Owner" yang dapat menghapus riwayat Stock Opname.'
            ], 403);
        }

        OpnameReport::where('id', $id)->orWhere('report_no', $id)->delete();

        return response()->json([
            'success' => true,
            'message' => "Riwayat Berita Acara berhasil dihapus dari penyimpanan."
        ]);
    }

    /**
     * Bersihkan seluruh arsip Berita Acara (BASO) - Hanya Role Owner
     */
    public function clearAll(Request $request)
    {
        $user = $request->user();
        if ($user && $user->role !== 'Owner') {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak: Hanya pengguna dengan role "Owner" yang dapat membersihkan riwayat Stock Opname.'
            ], 403);
        }

        OpnameReport::truncate();

        return response()->json([
            'success' => true,
            'message' => "Seluruh arsip Berita Acara (BASO) berhasil dibersihkan dari penyimpanan."
        ]);
    }
}
