<?php

namespace App\Exports;

use App\Models\Transaction;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class MonthlyTransactionExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected string $startDate;
    protected string $endDate;

    public function __construct(string $startDate, string $endDate)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }

    public function collection()
    {
        return Transaction::with(['user', 'details.medicine'])
            ->where('payment_status', 'Paid')
            ->whereBetween('created_at', [
                $this->startDate . ' 00:00:00',
                $this->endDate . ' 23:59:59'
            ])
            ->orderBy('created_at', 'asc')
            ->get();
    }

    public function headings(): array
    {
        return [
            'Nomor Faktur',
            'Tanggal & Waktu',
            'Nama Kasir',
            'Nama Pasien/Pelanggan',
            'Metode Pembayaran',
            'Subtotal (Rp)',
            'Diskon (Rp)',
            'Pajak (Rp)',
            'Total Bersih (Rp)',
            'Status Pembayaran',
        ];
    }

    /**
     * @param Transaction $row
     */
    public function map($row): array
    {
        return [
            $row->invoice_number,
            $row->created_at->format('d/m/Y H:i'),
            $row->user ? $row->user->name : 'Sistem',
            $row->customer_name,
            $row->payment_method,
            $row->subtotal,
            $row->discount_amount,
            $row->tax_amount,
            $row->total_amount,
            $row->payment_status,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
                'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF0D9488']],
            ],
        ];
    }
}
