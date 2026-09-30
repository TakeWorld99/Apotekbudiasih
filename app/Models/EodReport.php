<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EodReport extends Model
{
    use HasFactory;

    protected $table = 'eod_reports';

    protected $guarded = ['id'];

    protected $casts = [
        'starting_cash' => 'float',
        'actual_cash_counted' => 'float',
        'deposit_cash' => 'float',
        'petty_expense' => 'float',
        'cash_sales' => 'float',
        'target_system_cash' => 'float',
        'cash_discrepancy' => 'float',
        'qris_sales' => 'float',
        'transfer_sales' => 'float',
        'debit_sales' => 'float',
        'total_non_cash_sales' => 'float',
        'total_gross_revenue' => 'float',
        'total_discounts' => 'float',
        'total_tuslah_embalase' => 'float',
        'total_cogs' => 'float',
        'gross_profit' => 'float',
        'profit_margin' => 'float',
        'average_basket' => 'float',
        'cash_tx_count' => 'integer',
        'qris_tx_count' => 'integer',
        'transfer_tx_count' => 'integer',
        'debit_tx_count' => 'integer',
        'total_invoices' => 'integer',
    ];
}
