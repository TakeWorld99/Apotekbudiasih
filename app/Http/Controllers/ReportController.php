<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
use App\Exports\MonthlyTransactionExport;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ReportController extends Controller
{
    protected ReportService $reportService;

    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    public function salesSummary(Request $request): JsonResponse
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $categoryId = $request->input('category_id');

        $data = $this->reportService->getSalesReportSummary($startDate, $endDate, $categoryId);

        return response()->json($data);
    }

    public function inventoryHealth(): JsonResponse
    {
        $data = $this->reportService->getInventoryHealthReport();
        return response()->json($data);
    }

    public function exportExcel(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->toDateString());
        $filename = "Laporan_Penjualan_Apotek_Budi_Asih_{$startDate}_sampai_{$endDate}.xlsx";

        return Excel::download(new MonthlyTransactionExport($startDate, $endDate), $filename);
    }
}
