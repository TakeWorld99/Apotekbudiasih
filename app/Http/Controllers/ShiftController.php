<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Exception;

class ShiftController extends Controller
{
    /**
     * Dapatkan status shift kasir yang sedang aktif
     */
    public function current(): JsonResponse
    {
        // Mock / Database retrieval
        $shift = [
            'id' => 1,
            'user_id' => auth()->id() ?? 3,
            'cashier_name' => auth()->user()->name ?? 'Budi Santoso',
            'start_time' => date('Y-m-d 07:00:00'),
            'starting_cash' => 200000,
            'total_cash_sales' => 109000,
            'total_non_cash_sales' => 64000,
            'is_active' => true,
        ];

        return response()->json([
            'status' => 'success',
            'data' => $shift
        ]);
    }

    /**
     * Buka Shift Kasir Baru
     */
    public function open(Request $request): JsonResponse
    {
        $request->validate([
            'starting_cash' => 'required|numeric|min:0',
        ]);

        $newShift = [
            'id' => time(),
            'user_id' => auth()->id() ?? 3,
            'cashier_name' => auth()->user()->name ?? 'Budi Santoso',
            'start_time' => date('Y-m-d H:i:s'),
            'starting_cash' => (float) $request->input('starting_cash'),
            'total_cash_sales' => 0,
            'total_non_cash_sales' => 0,
            'is_active' => true,
        ];

        return response()->json([
            'status' => 'success',
            'message' => 'Shift kasir berhasil dibuka.',
            'data' => $newShift
        ], 201);
    }

    /**
     * Tutup Shift Kasir & Rekonsiliasi Uang Fisik
     */
    public function close(Request $request): JsonResponse
    {
        $request->validate([
            'counted_cash' => 'required|numeric|min:0',
            'notes' => 'nullable|string|max:255',
        ]);

        $counted = (float) $request->input('counted_cash');
        $expectedCash = 309000; // starting_cash + total_cash_sales
        $difference = $counted - $expectedCash;

        return response()->json([
            'status' => 'success',
            'message' => 'Shift kasir berhasil ditutup dan direkonsiliasi.',
            'data' => [
                'closed_at' => date('Y-m-d H:i:s'),
                'counted_cash' => $counted,
                'expected_cash' => $expectedCash,
                'difference' => $difference,
                'difference_status' => $difference === 0 ? 'Balance' : ($difference > 0 ? 'Surplus' : 'Shortage'),
            ]
        ]);
    }
}
