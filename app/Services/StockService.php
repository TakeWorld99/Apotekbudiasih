<?php

namespace App\Services;

use App\Models\Medicine;
use App\Models\StockLog;
use Illuminate\Support\Facades\DB;
use Exception;

class StockService
{
    /**
     * Mengurangi stok obat (Penjualan / Resep / Rusak) secara atomik dengan row lock
     * 
     * @param int $medicineId
     * @param int $qty
     * @param string $reason
     * @param string|null $referenceId (misal invoice number)
     * @param int|null $userId
     * @return Medicine
     * @throws Exception
     */
    public function decreaseStock(int $medicineId, int $qty, string $reason = 'Penjualan Kasir', ?string $referenceId = null, ?int $userId = null): Medicine
    {
        if ($qty <= 0) {
            throw new Exception("Jumlah pengurangan stok harus lebih dari 0.");
        }

        return DB::transaction(function () use ($medicineId, $qty, $reason, $referenceId, $userId) {
            /** @var Medicine $medicine */
            $medicine = Medicine::lockForUpdate()->findOrFail($medicineId);

            if ($medicine->stock < $qty) {
                throw new Exception("Stok untuk obat '{$medicine->name}' tidak mencukupi. Tersedia: {$medicine->stock}, diminta: {$qty}");
            }

            $medicine->stock -= $qty;
            $medicine->save();

            StockLog::create([
                'medicine_id'   => $medicine->id,
                'user_id'       => $userId,
                'type'          => 'Out',
                'qty'           => -$qty,
                'current_stock' => $medicine->stock,
                'reason'        => $reason,
                'reference_id'  => $referenceId,
                'created_at'    => now(),
            ]);

            return $medicine;
        });
    }

    /**
     * Menambah stok obat (Penerimaan dari Distributor/PBF atau Retur)
     * 
     * @param int $medicineId
     * @param int $qty
     * @param string $reason
     * @param string|null $referenceId
     * @param int|null $userId
     * @return Medicine
     */
    public function increaseStock(int $medicineId, int $qty, string $reason = 'Penerimaan Supplier', ?string $referenceId = null, ?int $userId = null): Medicine
    {
        if ($qty <= 0) {
            throw new Exception("Jumlah penambahan stok harus lebih dari 0.");
        }

        return DB::transaction(function () use ($medicineId, $qty, $reason, $referenceId, $userId) {
            $medicine = Medicine::lockForUpdate()->findOrFail($medicineId);

            $medicine->stock += $qty;
            $medicine->save();

            StockLog::create([
                'medicine_id'   => $medicine->id,
                'user_id'       => $userId,
                'type'          => 'In',
                'qty'           => $qty,
                'current_stock' => $medicine->stock,
                'reason'        => $reason,
                'reference_id'  => $referenceId,
                'created_at'    => now(),
            ]);

            return $medicine;
        });
    }

    /**
     * Penyesuaian stok manual (Stock Opname Fisik / Koreksi Sistem)
     * 
     * @param int $medicineId
     * @param int $actualStock
     * @param string $reason
     * @param int|null $userId
     * @return Medicine
     */
    public function adjustStock(int $medicineId, int $actualStock, string $reason = 'Stock Opname Fisik', ?int $userId = null): Medicine
    {
        if ($actualStock < 0) {
            throw new Exception("Stok fisik aktual tidak boleh bernilai negatif.");
        }

        return DB::transaction(function () use ($medicineId, $actualStock, $reason, $userId) {
            $medicine = Medicine::lockForUpdate()->findOrFail($medicineId);

            $difference = $actualStock - $medicine->stock;
            if ($difference === 0) {
                return $medicine;
            }

            $medicine->stock = $actualStock;
            $medicine->save();

            StockLog::create([
                'medicine_id'   => $medicine->id,
                'user_id'       => $userId,
                'type'          => 'Adjust',
                'qty'           => $difference,
                'current_stock' => $medicine->stock,
                'reason'        => "{$reason} (Penyesuaian: " . ($difference > 0 ? "+{$difference}" : "{$difference}") . ")",
                'reference_id'  => 'OPNAME-' . date('YmdHis'),
                'created_at'    => now(),
            ]);

            return $medicine;
        });
    }
}
